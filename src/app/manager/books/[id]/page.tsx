"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    categoryId: "",
    year: "",
    language: "",
    edition: "",
    description: "",
    location: "",
    cover: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
      });

    // Fetch existing book data
    fetch(`/api/books/${bookId}`)
      .then((r) => r.json())
      .then((data) => {
        setFormData({
          title: data.Title || "",
          author: data.Author || "",
          isbn: data.ISBN || "",
          categoryId: data.CategoryID || "",
          year: data.PublicationYear ? String(data.PublicationYear) : "",
          language: data.Language || "",
          edition: data.Edition || "",
          description: data.Description || "",
          location: data.ShelfLocation || "",
          cover: data.CoverImage || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load book data");
        setLoading(false);
      });
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/manager/books");
        router.refresh();
      } else {
        setError(data.error || "Error updating book");
      }
    } catch (err: any) {
      setError("Network error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="animate-pulse bg-gray-200 h-8 w-1/2 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              required
              type="text"
              value={formData.title}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              required
              type="text"
              value={formData.author}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              type="text"
              value={formData.isbn}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              required
              value={formData.categoryId}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.CategoryID} value={c.CategoryID}>
                  {c.CategoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Publication Year
            </label>
            <input
              type="number"
              value={formData.year}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <input
              type="text"
              value={formData.language}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Edition
            </label>
            <input
              type="text"
              value={formData.edition}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, edition: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shelf Location
            </label>
            <input
              type="text"
              value={formData.location}
              className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Image URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.cover}
            className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
            onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            className="mt-1 w-full p-2 border rounded focus:ring-olive focus:border-olive"
            rows={3}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-olive text-white rounded hover:bg-olive-dark"
          >
            Update Book
          </button>
        </div>
      </form>
    </div>
  );
}
