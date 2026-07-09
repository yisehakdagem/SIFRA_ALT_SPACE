"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ redirectUrl = "/login" }: { redirectUrl?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Force a hard reload to clear all states and client caches
    window.location.href = redirectUrl;
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-bold text-red-300 hover:text-red-100 transition-colors px-3 py-1 rounded bg-red-900/30 hover:bg-red-900/50 border border-red-800/30"
    >
      Logout
    </button>
  );
}
