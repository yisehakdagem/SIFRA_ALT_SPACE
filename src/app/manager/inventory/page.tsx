"use client";

import { useState, useEffect } from "react";

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", price: "", stock: "" });

  const [showRestockModal, setShowRestockModal] = useState<{ id: string, name: string } | null>(null);
  const [restockAmount, setRestockAmount] = useState("");

  const [toast, setToast] = useState<{ message: string, type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/cafe/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/cafe/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm)
    });
    if (res.ok) {
      showToast("Product created successfully!", "success");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", price: "", stock: "" });
      fetchProducts();
    } else {
      showToast("Failed to create product");
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal) return;
    
    const res = await fetch(`/api/cafe/products/${showRestockModal.id}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseInt(restockAmount) })
    });
    
    if (res.ok) {
      showToast("Product restocked successfully!", "success");
      setShowRestockModal(null);
      setRestockAmount("");
      fetchProducts();
    } else {
      showToast("Failed to restock product");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Café Inventory</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-olive text-white px-4 py-2 rounded font-semibold hover:bg-olive-dark">
          + Create New Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.ProductID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.ProductName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.SellingPrice} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${p.CurrentStock > 20 ? 'bg-green-100 text-green-800' : p.CurrentStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {p.CurrentStock} units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setShowRestockModal({ id: p.ProductID, name: p.ProductName })}
                    className="text-olive hover:text-olive-dark font-bold bg-olive/10 px-3 py-1 rounded"
                  >
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive">New Product</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input type="text" required value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price (ETB)</label>
                  <input type="number" required value={createForm.price} onChange={e => setCreateForm({...createForm, price: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                  <input type="number" required value={createForm.stock} onChange={e => setCreateForm({...createForm, stock: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-olive text-white font-bold rounded hover:bg-olive-dark">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-2 font-serif text-olive">Restock Product</h3>
            <p className="text-gray-600 mb-4 font-bold">{showRestockModal.name}</p>
            <form onSubmit={handleRestock}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={restockAmount} 
                  onChange={e => setRestockAmount(e.target.value)} 
                  className="w-full p-2 border rounded focus:ring-olive" 
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowRestockModal(null)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-olive text-white font-bold rounded hover:bg-olive-dark">Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
