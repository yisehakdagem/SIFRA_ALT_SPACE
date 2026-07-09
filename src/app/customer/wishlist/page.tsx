import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";
import WishlistClientView from "./WishlistClientView";

export default async function CustomerWishlistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user: any = await verifyJwt(token as string);

  const wishlistItems = await prisma.wishlist.findMany({
    where: { UserID: user.userId },
    include: { Book: true },
    orderBy: { CreatedAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-olive mb-8">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link href="/books" className="px-6 py-2 bg-olive text-white rounded font-bold hover:bg-olive-dark">Browse Books</Link>
        </div>
      ) : (
        <WishlistClientView initialItems={wishlistItems} />
      )}
    </div>
  );
}
