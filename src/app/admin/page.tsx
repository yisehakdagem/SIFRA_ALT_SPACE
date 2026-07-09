import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const usersCount = await prisma.user.count();
  const booksCount = await prisma.book.count();
  const eventsCount = await prisma.event.count();
  
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Users</h3>
          <p className="text-4xl font-bold text-black mt-2">{usersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Books</h3>
          <p className="text-4xl font-bold text-black mt-2">{booksCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Events</h3>
          <p className="text-4xl font-bold text-black mt-2">{eventsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/managers" className="block text-olive hover:underline"> Manage Manager Accounts</Link>
            <Link href="/admin/users" className="block text-olive hover:underline"> Manage Customers</Link>
            <Link href="/admin/reports" className="block text-olive hover:underline"> View Financial Reports</Link>
            <Link href="/admin/settings" className="block text-olive hover:underline"> Configure Library Rules</Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Recent System Alerts</h3>
          <p className="text-gray-500 italic">No critical alerts at this time.</p>
        </div>
      </div>
    </div>
  );
}
