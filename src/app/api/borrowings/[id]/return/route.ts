import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const borrowingId = params.id;
    const borrowing = await prisma.borrowing.findUnique({ where: { BorrowingID: borrowingId } });

    if (!borrowing || borrowing.Status === "Returned") {
      return NextResponse.json({ error: "Borrowing not found or already returned" }, { status: 400 });
    }

    const result = await prisma.$transaction([
      prisma.borrowing.update({
        where: { BorrowingID: borrowingId },
        data: {
          Status: "Returned",
          ReturnedAt: new Date(),
        }
      }),
      prisma.bookCopy.update({
        where: { CopyID: borrowing.CopyID },
        data: { Status: "Available" }
      })
    ]);

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
