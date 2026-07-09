import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        OrderItems: { include: { Product: true } },
        Payments: true,
      },
      orderBy: { OrderDate: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, paymentMethod } = await req.json();
    
    // items = [{ productId, quantity, unitPrice }]

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }
    const discount = 0;
    const totalAmount = subtotal - discount;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          Subtotal: subtotal,
          Discount: discount,
          TotalAmount: totalAmount,
          Status: "Completed",
          OrderItems: {
            create: items.map((item: any) => ({
              ProductID: item.productId,
              Quantity: item.quantity,
              UnitPrice: item.unitPrice,
              Subtotal: item.quantity * item.unitPrice
            }))
          },
          Payments: {
            create: [{
              PaymentMethod: paymentMethod || "Cash",
              Amount: totalAmount,
              PaymentStatus: "Paid"
            }]
          }
        }
      });

      // 2. Update Inventory & create logs
      for (const item of items) {
        await tx.product.update({
          where: { ProductID: item.productId },
          data: { CurrentStock: { decrement: item.quantity } }
        });

        await tx.inventoryLog.create({
          data: {
            ProductID: item.productId,
            QuantityChange: -item.quantity,
            MovementType: "Sale",
            ReferenceType: "Order",
            ReferenceID: order.OrderID,
            Remarks: "Café POS Sale"
          }
        });
      }

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
