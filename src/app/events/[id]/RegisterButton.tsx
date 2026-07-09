"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function RegisterButton({ eventId, isRegistered }: { eventId: string, isRegistered: boolean }) {
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{isOpen: boolean, isConfirm: boolean, message: string, onConfirm?: () => void}>({ isOpen: false, isConfirm: false, message: "" });
  const router = useRouter();

  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleRegister = async () => {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnUrl: window.location.href.split('?')[0] })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.requiresPayment) {
        // Redirect to Chapa
        window.location.href = data.checkout_url;
      } else {
        router.refresh();
      }
    } else {
      const error = await res.json();
      setModalState({ isOpen: true, isConfirm: false, message: `Failed to register: ${error.error || "Unknown error"}` });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalState({
      isOpen: true,
      isConfirm: true,
      message: "Are you sure you want to cancel your registration?",
      onConfirm: performCancel
    });
  };

  const performCancel = async () => {
    closeModal();
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/register`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setModalState({ isOpen: true, isConfirm: false, message: "Failed to cancel registration." });
      setLoading(false);
    }
  };

  return (
    <>
      {isRegistered ? (
        <button 
          onClick={handleCancel} 
          disabled={loading}
          className="px-8 py-3 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? "Processing..." : "Cancel Registration"}
        </button>
      ) : (
        <button 
          onClick={handleRegister} 
          disabled={loading}
          className="px-8 py-3 bg-olive text-white font-bold rounded-lg hover:bg-olive-dark transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? "Processing..." : "Register Now"}
        </button>
      )}
      <Modal 
        isOpen={modalState.isOpen}
        message={modalState.message}
        isConfirm={modalState.isConfirm}
        onConfirm={() => {
          if (modalState.onConfirm) modalState.onConfirm();
          else closeModal();
        }}
        onCancel={closeModal}
      />
    </>
  );
}
