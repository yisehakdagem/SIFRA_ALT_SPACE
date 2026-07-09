import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: { Product: true },
      orderBy: { RecordedAt: 'desc' }
    });
    return NextResponse.json(logs);
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

    const { productId, quantity, reason } = await req.json();

    const result = await prisma.$transaction([
      prisma.product.update({
        where: { ProductID: productId },
        data: { CurrentStock: { increment: quantity } }
      }),
      prisma.inventoryLog.create({
        data: {
          ProductID: productId,
          QuantityChange: quantity,
          MovementType: "Restock",
          Remarks: reason
        }
      })
    ]);

    return NextResponse.json(result[1], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
