"use client";

import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return (
      <header className="bg-olive/95 backdrop-blur-md text-white shadow-sm sticky top-0 z-50">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo className="h-10 text-gold" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-olive/95 backdrop-blur-md text-white shadow-sm sticky top-0 z-50">
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo on Left */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-10 text-gold" />
          </Link>

          {/* Right Section: Hyperlinks + Avatar + Mobile Menu */}
          <div className="flex items-center gap-6 md:gap-8 ml-auto">
            {/* Desktop Hyperlinks */}
            <div className="hidden md:flex items-center space-x-8 font-bold text-sm uppercase tracking-wide">
              <Link href="/" className="hover:text-gold-light transition-colors">Home</Link>
              <Link href="/cafe" className="hover:text-gold-light transition-colors">Café</Link>
              <Link href="/books" className="hover:text-gold-light transition-colors">Books</Link>
              <Link href="/events" className="hover:text-gold-light transition-colors">Events</Link>
            </div>

            {/* Avatar / Login */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative flex items-center space-x-4">
                  {/* Profile Dropdown Toggle */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-olive font-bold text-lg hover:ring-2 hover:ring-white transition-all shadow-sm"
                    title={`${user.name} (${user.role})`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-2 min-w-48 z-50">
                      <Link
                        href={
                          user.role === 'Administrator' ? '/admin' :
                          user.role === 'Manager' ? '/manager' : '/customer'
                        }
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/customer/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="hover:text-gold-light font-bold">Login</Link>
                  <Link href="/register" className="px-4 py-2 bg-beige text-dark font-bold rounded-lg hover:bg-white transition-colors">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Icon (Hidden on Desktop) */}
            <MobileMenu />
          </div>
          
        </div>
      </nav>
    </header>
  );
}
