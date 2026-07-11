import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const user: any = await verifyJwt(token);
  if (!user || (user.role !== "Manager" && user.role !== "Administrator")) redirect("/login");

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-olive text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold font-serif text-gold mb-8">Manager Dashboard</h2>
        <nav className="space-y-4">
          <Link href="/manager" className="block hover:text-gold-light">Overview</Link>
          <Link href="/manager/pos" className="block hover:text-gold-light">Café POS</Link>
          <Link href="/manager/menu-items" className="block hover:text-gold-light">Menu Items</Link>
          <Link href="/manager/inventory" className="block hover:text-gold-light">Inventory</Link>
          <Link href="/manager/orders" className="block hover:text-gold-light">Orders History</Link>
          <Link href="/manager/books" className="block hover:text-gold-light">Library Books</Link>
          <Link href="/manager/borrowings" className="block hover:text-gold-light">Borrowings</Link>
          <Link href="/manager/events" className="block hover:text-gold-light">Events</Link>
          <Link href="/manager/reports" className="block hover:text-gold-light">Reports</Link>
          <Link href="/" className="block mt-8 text-cream/70 hover:text-white">Back to Main</Link>
        </nav>
        <div className="mt-8 border-t border-olive-light pt-4">
          <LogoutButton redirectUrl="/staff-login" />
        </div>
      </aside>
      <main className="flex-1 p-8 text-dark overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
