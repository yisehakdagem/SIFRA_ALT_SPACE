import { prisma } from "@/lib/prisma";

export default async function CafeMenuPage() {
  const products = await prisma.product.findMany({
    orderBy: { ProductName: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-olive mb-4">Café Menu</h1>
        <p className="text-gray-600">Enjoy our selection of hand-crafted drinks and fresh pastries.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product) => (
          <div key={product.ProductID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{product.ProductName}</h3>
              <p className="text-gray-600 mt-1 text-sm">{product.Description}</p>
              {product.CurrentStock <= 0 ? (
                <span className="inline-block mt-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Sold Out</span>
              ) : (
                <span className="inline-block mt-2 text-xs font-semibold text-olive bg-olive/10 px-2 py-1 rounded">Available</span>
              )}
            </div>
            <div className="text-xl font-bold text-gold">
              {product.SellingPrice} ETB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
