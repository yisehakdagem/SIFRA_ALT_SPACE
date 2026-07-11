import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeBorrowings, todayOrders, lowStockItems] = await Promise.all([
    prisma.borrowing.count({ where: { Status: "Active" } }),
    prisma.order.findMany({ where: { OrderDate: { gte: today } } }),
    prisma.inventoryItem.count({ where: { CurrentStock: { lt: 20 } } }),
  ]);

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + order.TotalAmount,
    0,
  );

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        Manager Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase">
            Today's Sales
          </h3>
          <p className="text-3xl font-bold text-gold mt-2">
            {todayRevenue} ETB
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase">
            Orders Today
          </h3>
          <p className="text-3xl font-bold text-olive mt-2">
            {todayOrders.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase">
            Active Borrowings
          </h3>
          <p className="text-3xl font-bold text-gold mt-2">
            {activeBorrowings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-red-500">
          <h3 className="text-gray-500 font-medium text-sm uppercase">
            Low Stock Alerts
          </h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {lowStockItems}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/manager/pos"
          className="bg-olive text-white p-8 rounded-lg shadow text-center hover:bg-olive-dark transition-colors"
        >
          <div className="text-4xl mb-2"></div>
          <h2 className="text-xl font-bold">Open Café POS</h2>
        </Link>
        <Link
          href="/manager/borrowings"
          className="bg-olive text-white p-8 rounded-lg shadow text-center hover:bg-olive-dark transition-colors"
        >
          <div className="text-4xl mb-2"></div>
          <h2 className="text-xl font-bold">Checkout Desk</h2>
        </Link>
        <Link
          href="/manager/books"
          className="bg-gold text-white p-8 rounded-lg shadow text-center hover:bg-gold-light transition-colors"
        >
          <div className="text-4xl mb-2"></div>
          <h2 className="text-xl font-bold">Library Catalog</h2>
        </Link>
      </div>
    </div>
  );
}
