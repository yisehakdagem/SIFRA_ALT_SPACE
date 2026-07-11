"use client";

import { useState, useEffect } from "react";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", price: "" });
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", status: "Available" });
  
  const [toast, setToast] = useState<{ message: string, type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMenuItems = async () => {
    const res = await fetch("/api/cafe/products");
    if (res.ok) setMenuItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/cafe/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm)
    });
    if (res.ok) {
      showToast("Menu item created successfully!", "success");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", price: "" });
      fetchMenuItems();
    } else {
      showToast("Failed to create menu item");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const res = await fetch(`/api/cafe/menu-items/${editingItem.ProductID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      showToast("Menu item updated successfully!", "success");
      setEditingItem(null);
      fetchMenuItems();
    } else {
      showToast("Failed to update menu item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const res = await fetch(`/api/cafe/menu-items/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      showToast("Menu item deleted successfully!", "success");
      fetchMenuItems();
    } else {
      showToast("Failed to delete menu item");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Menu Items</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-olive text-white px-4 py-2 rounded font-semibold hover:bg-olive-dark">
          + Add Menu Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuItems.map((item) => (
              <tr key={item.ProductID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.ProductName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.SellingPrice} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${item.Status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    onClick={() => {
                      setEditingItem(item);
                      setEditForm({ 
                        name: item.ProductName, 
                        description: item.Description || "", 
                        price: item.SellingPrice.toString(), 
                        status: item.Status 
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold bg-blue-100 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.ProductID)}
                    className="text-red-600 hover:text-red-800 font-bold bg-red-100 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive">Add Menu Item</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (ETB)</label>
                  <input type="number" required value={createForm.price} onChange={e => setCreateForm({...createForm, price: e.target.value})} className="w-full mt-1 p-2 border rounded" />
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

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive">Edit Menu Item</h3>
            <form onSubmit={handleEdit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (ETB)</label>
                  <input type="number" required value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full mt-1 p-2 border rounded">
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-olive text-white font-bold rounded hover:bg-olive-dark">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
