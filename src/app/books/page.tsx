import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CatalogPage() {
  const books = await prisma.book.findMany({
    include: { Category: true, Copies: true },
    orderBy: { CreatedAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-olive mb-8">Library Catalog</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          const available = book.Copies.filter(c => c.Status === "Available").length;
          return (
            <Link href={`/books/${book.BookID}`} key={book.BookID} className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[2/3] w-full bg-gray-100 relative">
                {book.CoverImage ? (
                  <img src={book.CoverImage} alt={book.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Cover</div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-gold uppercase tracking-wider">{book.Category.CategoryName}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{book.Title}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.Author}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {available} copies available
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
