"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBookPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "", author: "", isbn: "", categoryId: "", year: "", language: "", edition: "", description: "", location: "", cover: "", copies: "1"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].CategoryID }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push("/manager/books");
        router.refresh(); // Ensure the list updates
      } else {
        setError(data.error || "Error creating book");
      }
    } catch (err: any) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input required type="text" className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <input required type="text" className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, author: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ISBN</label>
            <input type="text" className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, isbn: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select required value={formData.categoryId} className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, categoryId: e.target.value})}>
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Publication Year</label>
            <input type="number" className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Copies to Generate</label>
            <input required type="number" min="1" value={formData.copies} className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, copies: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
          <input type="url" placeholder="https://..." className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" onChange={e => setFormData({...formData, cover: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive" rows={3} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-olive text-white rounded hover:bg-olive-dark">Save Book</button>
        </div>
      </form>
    </div>
  );
}
