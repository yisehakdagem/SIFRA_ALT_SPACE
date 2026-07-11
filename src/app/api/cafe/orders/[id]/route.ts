import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = id;
    const { items } = await request.json(); // Array of { productId or menuItemId, quantity, unitPrice }

    let subtotal = 0;
    const orderItemsData = items.map((item: any) => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return {
        MenuItemID: item.menuItemId || item.productId,
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
          OrderItems: { include: { MenuItem: true } }
        }
      });
      
      // Transform to match old format
      const transformedOrder = {
        ...updatedOrder,
        OrderItems: updatedOrder.OrderItems.map(item => ({
          ...item,
          Product: {
            ProductID: item.MenuItem.MenuItemID,
            ProductName: item.MenuItem.Name,
            SellingPrice: item.MenuItem.Price
          }
        }))
      };
      return transformedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { OrderID: id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
