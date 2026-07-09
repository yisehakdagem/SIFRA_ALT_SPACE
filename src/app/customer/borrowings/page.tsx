import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";

export default async function CustomerBorrowingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user: any = await verifyJwt(token as string);

  const borrowings = await prisma.borrowing.findMany({
    where: { UserID: user.userId },
    include: {
      Copy: {
        include: { Book: true }
      }
    },
    orderBy: { BorrowedAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-olive mb-8">My Borrowings</h1>
      
      {borrowings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't borrowed any books yet.</p>
          <Link href="/books" className="px-6 py-2 bg-olive text-white rounded font-bold hover:bg-olive-dark">Browse Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowings.map((b) => (
            <div key={b.BorrowingID} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <img 
                  src={b.Copy.Book.CoverImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.Copy.Book.Title)}&background=random`} 
                  alt={b.Copy.Book.Title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{b.Copy.Book.Title}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex-1">By {b.Copy.Book.Author}</p>
                
                <div className="space-y-2 border-t pt-4 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Borrowed:</span>
                    <span className="font-medium text-gray-900">{b.BorrowedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-bold ${b.Status === 'Active' ? 'text-olive' : 'text-gray-400'}`}>
                      {b.Status}
                    </span>
                  </div>
                  {b.ReturnedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Returned:</span>
                      <span className="font-medium text-gray-900">{b.ReturnedAt.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
