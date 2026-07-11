import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        OrderItems: { include: { MenuItem: true } },
        Payments: true,
      },
      orderBy: { OrderDate: 'desc' }
    });
    // Transform to match old format for compatibility
    const transformedOrders = orders.map(order => ({
      ...order,
      OrderItems: order.OrderItems.map(item => ({
        ...item,
        Product: {
          ProductID: item.MenuItem.MenuItemID,
          ProductName: item.MenuItem.Name,
          SellingPrice: item.MenuItem.Price
        }
      }))
    }));
    return NextResponse.json(transformedOrders);
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
    
    // items = [{ productId (menuItemId), quantity, unitPrice }]

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
              MenuItemID: item.productId,
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
        },
        include: {
          OrderItems: { include: { MenuItem: true } }
        }
      });

      // 2. Update Inventory & create logs for each menu item's linked inventory items
      for (const orderItem of order.OrderItems) {
        const menuItem = orderItem.MenuItem;
        const inventoryLinks = await tx.menuItemInventory.findMany({
          where: { MenuItemID: menuItem.MenuItemID },
          include: { InventoryItem: true }
        });
        for (const link of inventoryLinks) {
          await tx.inventoryItem.update({
            where: { InventoryItemID: link.InventoryItemID },
            data: { CurrentStock: { decrement: link.QuantityRequired * orderItem.Quantity } }
          });
          await tx.inventoryLog.create({
            data: {
              InventoryItemID: link.InventoryItemID,
              QuantityChange: -(link.QuantityRequired * orderItem.Quantity),
              MovementType: "Sale",
              ReferenceType: "Order",
              ReferenceID: order.OrderID,
              Remarks: `Sold ${orderItem.Quantity}x ${menuItem.Name}`
            }
          });
        }
      }

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
