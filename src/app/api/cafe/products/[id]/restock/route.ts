import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { ProductID: params.id },
        data: { CurrentStock: { increment: amount } }
      });

      await tx.inventoryLog.create({
        data: {
          ProductID: params.id,
          QuantityChange: amount,
          MovementType: "Restock",
          Remarks: "Manual restock by Manager"
        }
      });

      return product;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
