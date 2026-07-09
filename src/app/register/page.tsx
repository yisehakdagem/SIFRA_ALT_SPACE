"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow border border-gray-100 mb-12">
      <h1 className="text-3xl font-serif font-bold text-center mb-6 text-olive">Create an Account</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              type="text" 
              required 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              type="text" 
              required 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
          <input 
            type="text" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
          <textarea 
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-olive focus:border-olive" 
          />
        </div>
        <button type="submit" className="w-full bg-olive text-white py-2 rounded font-semibold hover:bg-olive/90">
          Create Account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <Link href="/login" className="text-gold font-semibold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
