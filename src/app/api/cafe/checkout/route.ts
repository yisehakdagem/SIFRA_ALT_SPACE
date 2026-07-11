import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const { orderId, paymentMethod, txRef } = await req.json();

    const order = await prisma.order.findUnique({
      where: { OrderID: orderId },
      include: { 
        OrderItems: { 
          include: { 
            MenuItem: { 
              include: { 
                InventoryItems: { 
                  include: { InventoryItem: true } 
                } 
              } 
            } 
          } 
        } 
      }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.Status === "Completed") return NextResponse.json({ error: "Order already completed" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update order to completed
      const updatedOrder = await tx.order.update({
        where: { OrderID: orderId },
        data: { Status: "Completed" }
      });

      // 2. Create payment record
      await tx.payment.create({
        data: {
          OrderID: orderId,
          PaymentMethod: paymentMethod,
          Amount: order.TotalAmount,
          PaymentStatus: "Paid",
          TransactionReference: txRef || `CASH-${Date.now()}`
        }
      });

      // 3. Deduct inventory and log
      for (const item of order.OrderItems) {
        const menuItem = item.MenuItem;
        for (const invLink of menuItem.InventoryItems) {
          const invItem = invLink.InventoryItem;
          await tx.inventoryItem.update({
            where: { InventoryItemID: invItem.InventoryItemID },
            data: { CurrentStock: { decrement: invLink.QuantityRequired * item.Quantity } }
          });

          await tx.inventoryLog.create({
            data: {
              InventoryItemID: invItem.InventoryItemID,
              QuantityChange: -(invLink.QuantityRequired * item.Quantity),
              MovementType: "Sale",
              ReferenceType: "Order",
              ReferenceID: orderId,
              Remarks: `Sold ${item.Quantity}x ${menuItem.Name}`
            }
          });
        }
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
