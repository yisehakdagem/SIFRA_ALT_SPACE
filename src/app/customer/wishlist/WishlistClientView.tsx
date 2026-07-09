"use client";

import { useState } from "react";
import Link from "next/link";

export default function WishlistClientView({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (wishlistId: string) => {
    const res = await fetch(`/api/wishlist/${wishlistId}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter(i => i.WishlistID !== wishlistId));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.WishlistID} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="h-48 bg-gray-100 flex items-center justify-center relative group">
            <img 
              src={item.Book.CoverImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.Book.Title)}&background=random`} 
              alt={item.Book.Title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleRemove(item.WishlistID)}
                className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 shadow-lg"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.Book.Title}</h3>
            <p className="text-sm text-gray-500 mb-4">By {item.Book.Author}</p>
            <div className="mt-auto">
              <Link href={`/books`} className="text-olive font-bold hover:text-gold text-sm uppercase tracking-wider">
                View in Library
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="col-span-full text-center text-gray-500 p-8">
          Item removed. Your wishlist is now empty.
        </div>
      )}
    </div>
  );
}
