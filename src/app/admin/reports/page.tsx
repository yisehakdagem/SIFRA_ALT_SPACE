import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  const orders = await prisma.order.findMany();
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.TotalAmount, 0);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">System Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">All-Time Café Revenue</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalRevenue.toLocaleString()} ETB</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 border-l-4 border-l-olive">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Orders Processed</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">{orders.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Export Options</h3>
        <p className="text-gray-600 mb-4">Export full historical data to CSV for external accounting software.</p>
        <button className="bg-olive text-white px-4 py-2 rounded hover:bg-olive-dark">Export All Data (CSV)</button>
      </div>
    </div>
  );
}
