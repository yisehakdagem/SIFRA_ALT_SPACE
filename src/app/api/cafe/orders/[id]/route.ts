import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const orderId = params.id;
    const { items } = await req.json(); // Array of { productId, quantity, unitPrice }

    let subtotal = 0;
    const orderItemsData = items.map((item: any) => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return {
        ProductID: item.productId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
        Subtotal: itemTotal
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete old items
      await tx.orderItem.deleteMany({ where: { OrderID: orderId } });
      
      // 2. Add new items and update totals
      const updatedOrder = await tx.order.update({
        where: { OrderID: orderId },
        data: {
          Subtotal: subtotal,
          TotalAmount: subtotal,
          OrderItems: {
            create: orderItemsData
          }
        },
        include: {
          OrderItems: { include: { Product: true } }
        }
      });
      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.order.delete({ where: { OrderID: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
