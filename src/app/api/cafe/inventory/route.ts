import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: { InventoryLogs: { orderBy: { RecordedAt: "desc" } } }
    });
    return NextResponse.json(inventoryItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        Name: data.name,
        CurrentStock: parseInt(data.stock) || 0,
        Unit: data.unit || "units"
      }
    });
    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
