import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        InventoryItems: {
          include: { InventoryItem: true }
        }
      }
    });
    // Return in a compatible format for existing code temporarily
    return NextResponse.json(menuItems.map(item => ({
      ProductID: item.MenuItemID,
      ProductName: item.Name,
      Description: item.Description,
      SellingPrice: item.Price,
      Status: item.Status,
      InventoryItems: item.InventoryItems
    })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const menuItem = await prisma.menuItem.create({
      data: {
        Name: data.name,
        Description: data.description,
        Price: parseFloat(data.price),
        Status: data.status || "Available"
      }
    });
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
