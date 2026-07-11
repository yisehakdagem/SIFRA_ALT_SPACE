import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await req.json();

    const existing = await prisma.wishlist.findUnique({
      where: { UserID_BookID: { UserID: user.userId as string, BookID: bookId } }
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: { WishlistID: existing.WishlistID }
      });
      return NextResponse.json({ wishlisted: false });
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          UserID: user.userId as string,
          BookID: bookId
        }
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
