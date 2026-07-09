import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const user: any = await verifyJwt(token);
  if (!user || user.role !== "Administrator") redirect("/login");

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-olive text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold font-serif text-gold mb-8">Admin Control</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block hover:text-gold">Overview</Link>
          <Link href="/admin/managers" className="block hover:text-gold">Manager Accounts</Link>
          <Link href="/admin/users" className="block hover:text-gold">Customer Accounts</Link>
          <Link href="/admin/reports" className="block hover:text-gold">System Reports</Link>
          <Link href="/admin/settings" className="block hover:text-gold">Settings</Link>
          <Link href="/admin/audit" className="block hover:text-gold">Audit Logs</Link>
          <Link href="/" className="block mt-8 text-gray-400 hover:text-white">Back to Main</Link>
        </nav>
        <div className="mt-8 border-t border-gray-700 pt-4">
          <LogoutButton redirectUrl="/staff-login" />
        </div>
      </aside>
      <main className="flex-1 p-8 text-gray-900 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
