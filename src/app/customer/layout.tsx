import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const user: any = await verifyJwt(token);
  if (!user || user.role !== "Customer") redirect("/login");

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-olive text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold font-serif text-gold mb-8">Customer Portal</h2>
        <nav className="space-y-4">
          <Link href="/customer" className="block hover:text-gold-light">Dashboard</Link>
          <Link href="/customer/borrowings" className="block hover:text-gold-light">My Borrowings</Link>
          <Link href="/customer/wishlist" className="block hover:text-gold-light">Wishlist</Link>
          <Link href="/customer/events" className="block hover:text-gold-light">My Events</Link>
          <Link href="/customer/profile" className="block hover:text-gold-light">Profile</Link>
          <Link href="/" className="block mt-8 text-cream/70 hover:text-white">Back to Main</Link>
        </nav>
        <div className="mt-8 border-t border-olive-light pt-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 text-dark">
        {children}
      </main>
    </div>
  );
}
