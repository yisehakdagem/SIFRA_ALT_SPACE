import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, paymentMethod, txRef } = await req.json();

    const order = await prisma.order.findUnique({
      where: { OrderID: orderId },
      include: { OrderItems: true }
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
        await tx.product.update({
          where: { ProductID: item.ProductID },
          data: { CurrentStock: { decrement: item.Quantity } }
        });

        await tx.inventoryLog.create({
          data: {
            ProductID: item.ProductID,
            QuantityChange: -item.Quantity,
            MovementType: "Sale",
            ReferenceType: "Order",
            ReferenceID: orderId,
            Remarks: "Café POS Sale"
          }
        });
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
