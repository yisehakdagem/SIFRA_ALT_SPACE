import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BookManagementPage() {
  const books = await prisma.book.findMany({
    include: { Category: true, Copies: true },
    orderBy: { CreatedAt: "desc" }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Book Management</h1>
        <Link href="/manager/books/add" className="bg-olive text-white px-4 py-2 rounded font-semibold hover:bg-olive-dark">
          + Add New Book
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies (Avail/Total)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => {
              const available = book.Copies.filter(c => c.Status === "Available").length;
              return (
                <tr key={book.BookID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{book.Title}</div>
                    <div className="text-sm text-gray-500">{book.ISBN || "No ISBN"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.Author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.Category?.CategoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {available} / {book.Copies.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/manager/books/${book.BookID}`} className="text-olive hover:text-olive-dark mr-4">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
