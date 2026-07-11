import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { Status: "Pending" },
      include: {
        OrderItems: { include: { MenuItem: true } }
      },
      orderBy: { OrderDate: 'asc' }
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
    const { orderName } = await req.json();

    const order = await prisma.order.create({
      data: {
        OrderName: orderName,
        Status: "Pending",
        Subtotal: 0,
        TotalAmount: 0
      }
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
