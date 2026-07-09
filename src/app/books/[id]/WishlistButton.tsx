"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function WishlistButton({ bookId, initialWishlisted }: { bookId: string, initialWishlisted: boolean }) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, message: "" });
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    if (res.ok) {
      const data = await res.json();
      setWishlisted(data.wishlisted);
      router.refresh();
    } else {
      const error = await res.json();
      setModalState({ isOpen: true, message: `Failed to update wishlist: ${error.error}` });
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`px-6 py-2 border border-olive font-semibold rounded transition-colors ${
          wishlisted 
            ? "bg-olive text-white hover:bg-olive-dark" 
            : "text-olive hover:bg-olive hover:text-white"
        } disabled:opacity-50`}
      >
        {loading ? "..." : wishlisted ? "Added to Wishlist" : "Add to Wishlist"}
      </button>
      <Modal 
        isOpen={modalState.isOpen}
        message={modalState.message}
        onConfirm={() => setModalState({ ...modalState, isOpen: false })}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
}
