"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-white hover:text-gold transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="bg-olive w-64 h-full p-6 shadow-2xl flex flex-col">
            <div className="flex justify-end mb-8">
              <button onClick={() => setIsOpen(false)} className="p-2 text-white hover:text-gold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col space-y-6 text-lg font-bold">
              <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-gold-light transition-colors">Home</Link>
              <Link href="/cafe" onClick={() => setIsOpen(false)} className="hover:text-gold-light transition-colors">Café</Link>
              <Link href="/books" onClick={() => setIsOpen(false)} className="hover:text-gold-light transition-colors">Books</Link>
              <Link href="/events" onClick={() => setIsOpen(false)} className="hover:text-gold-light transition-colors">Events</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
