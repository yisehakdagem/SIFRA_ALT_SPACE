import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CafeMenuPage() {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { Name: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-olive mb-4">Café Menu</h1>
        <p className="text-gray-600">Enjoy drinks and snacks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menuItems.map((item) => (
          <div key={item.MenuItemID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{item.Name}</h3>
              <p className="text-gray-600 mt-1 text-sm">{item.Description}</p>
              {item.Status === "Unavailable" ? (
                <span className="inline-block mt-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Unavailable</span>
              ) : (
                <span className="inline-block mt-2 text-xs font-semibold text-olive bg-olive/10 px-2 py-1 rounded">Available</span>
              )}
            </div>
            <div className="text-xl font-bold text-gold">
              {item.Price} ETB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
