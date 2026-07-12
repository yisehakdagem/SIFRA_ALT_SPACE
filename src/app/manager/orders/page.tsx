import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersHistoryPage() {
  let orders: any[] = [];
  try {

    orders = await prisma.order.findMany({
      include: {
        OrderItems: { include: { MenuItem: true } },
        Payments: true,
      },
      orderBy: { OrderDate: "desc" },
    });
  } catch (err) {
    console.error("[Orders Page] DB error:", err);
  }


  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        Café Order History
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.OrderID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {o.OrderID.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {o.OrderDate.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {o.OrderItems.map(
                    (i: any) => `${i.Quantity}x ${i.MenuItem.Name}`,
                  ).join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {o.TotalAmount} ETB
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {o.Status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
