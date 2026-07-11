import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import WishlistButton from "./WishlistButton";

export default async function BookDetailsPage(props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let user: any = null;
    
    if (token) {
      user = await verifyJwt(token);
    }

    const book = await prisma.book.findUnique({
      where: { BookID: params.id },
      include: {
        Category: true,
        Copies: true,
        WishlistedBy: true,
      }
    });

    if (!book) notFound();

    const availableCopies = book.Copies.filter(c => c.Status === "Available").length;
    const isWishlisted = user ? book.WishlistedBy.some(w => w.UserID === user.userId) : false;

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/books" className="text-sm font-semibold text-olive hover:underline mb-8 inline-block">
          Back to Catalog
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Left: Cover */}
            <div className="md:w-1/3 bg-gray-100 flex-shrink-0">
              {book.CoverImage ? (
                <img src={book.CoverImage} alt={book.Title} className="w-full h-full object-cover aspect-[2/3]" />
              ) : (
                <div className="w-full h-full aspect-[2/3] flex items-center justify-center text-gray-400">
                  No Cover Image
                </div>
              )}
            </div>
            
            {/* Right: Details */}
            <div className="p-8 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gold uppercase tracking-wider">
                    {book.Category?.CategoryName || "Uncategorized"}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {availableCopies} copies available
                  </span>
                </div>
                
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{book.Title}</h1>
                <p className="text-lg text-gray-600 mb-6">by {book.Author}</p>
                
                <div className="prose prose-sm text-gray-600 mb-8">
                  <p>{book.Description || "No description available."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                  <div>
                    <p className="text-gray-500">ISBN</p>
                    <p className="font-semibold">{book.ISBN || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Publication Year</p>
                    <p className="font-semibold">{book.PublicationYear || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-semibold">{book.Language || "English"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Shelf Location</p>
                    <p className="font-semibold">{book.ShelfLocation || "General"}</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="pt-6 border-t border-gray-100">
                {user ? (
                  <div className="flex gap-4">
                    <WishlistButton bookId={book.BookID} initialWishlisted={isWishlisted} />
                    {(user.role === "Manager" || user.role === "Administrator") && (
                      <Link href={`/manager/borrowings?bookId=${book.BookID}`} className="px-6 py-2 bg-gold text-dark font-semibold rounded hover:bg-gold-light transition-colors">
                        Borrow for Customer
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="bg-beige/30 p-4 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Please log in to borrow this book or add it to your wishlist.</span>
                    <Link href="/login" className="px-6 py-2 bg-olive text-white font-semibold rounded hover:bg-olive-dark transition-colors">
                      Login
                    </Link>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Book details page error:", error);
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/books" className="text-sm font-semibold text-olive hover:underline mb-8 inline-block">
          Back to Catalog
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Could not load book details</p>
          <p className="text-sm mt-1">Please check your database connection and try again later.</p>
        </div>
      </div>
    );
  }
}
