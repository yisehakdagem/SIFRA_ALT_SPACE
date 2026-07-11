import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalBooks, activeBorrowings, todayOrders] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.borrowing.count({ where: { Status: "Active" } }),
      prisma.order.findMany({
        where: { OrderDate: { gte: today } }
      })
    ]);

    const todaySales = todayOrders.reduce((acc, order) => acc + order.TotalAmount, 0);

    return NextResponse.json({
      totalUsers,
      totalBooks,
      activeBorrowings,
      todaySales,
      todayOrdersCount: todayOrders.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
