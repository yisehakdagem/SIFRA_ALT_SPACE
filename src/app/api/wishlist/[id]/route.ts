import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wishlistId = id;
    
    // Ensure the wishlist item belongs to the user
    const item = await prisma.wishlist.findUnique({ where: { WishlistID: wishlistId } });
    if (!item || item.UserID !== user.userId) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
    }

    await prisma.wishlist.delete({ where: { WishlistID: wishlistId } });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
