"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, loginType: "staff" })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      return;
    }

    const data = await res.json();
    if (data.user.role === "Administrator") router.push("/admin");
    else if (data.user.role === "Manager") router.push("/manager");
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold font-serif text-olive">Staff Portal</h1>
            <p className="text-gray-500 text-sm mt-2">Authorized personnel only</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Staff Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full p-2 bg-white border border-gray-300 rounded focus:ring-olive focus:border-olive text-gray-900" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full p-2 bg-white border border-gray-300 rounded focus:ring-olive focus:border-olive text-gray-900" 
          />
        </div>
        <button type="submit" className="w-full bg-olive text-white py-2 rounded font-bold hover:bg-olive-dark mt-6">
          Authenticate
        </button>
      </form>
        </div>
      </div>
    </div>
  );
}
