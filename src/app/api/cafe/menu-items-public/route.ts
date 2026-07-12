import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { Name: "asc" },
      select: {
        MenuItemID: true,
        Name: true,
        Description: true,
        Price: true,
        Status: true,
      },
    });
    return NextResponse.json(menuItems);
  } catch (error: any) {
    console.error("[cafe/menu-items-public] Error:", error.message);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
