"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

export default function BorrowingManagementPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [modalState, setModalState] = useState({ isOpen: false, message: "" });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const fetchBorrowings = async () => {
    const res = await fetch("/api/borrowings");
    if (res.ok) {
      setBorrowings(await res.json());
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturn = async (id: string) => {
    const res = await fetch(`/api/borrowings/${id}/return`, { method: "POST" });
    if (res.ok) {
      setModalState({ isOpen: true, message: "Book returned successfully" });
      fetchBorrowings();
    } else {
      setModalState({ isOpen: true, message: "Failed to return book" });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Checkout Desk & Borrowings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold">Active Borrowing Records</h3>
          <button className="bg-olive text-white px-4 py-2 rounded text-sm font-bold">New Checkout</button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book & Copy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrowed At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowings.map((b) => (
              <tr key={b.BorrowingID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.User?.FirstName} {b.User?.LastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-bold">{b.Copy?.Book?.Title}</div>
                  <div className="text-gray-500 text-xs">Barcode: {b.Copy?.Barcode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(b.BorrowedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.Status === 'Active' ? 'bg-beige text-olive-dark' : 'bg-green-100 text-green-800'}`}>
                    {b.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {b.Status === "Active" ? (
                    <button onClick={() => handleReturn(b.BorrowingID)} className="text-olive hover:text-olive-dark font-bold">Process Return</button>
                  ) : (
                    <span className="text-gray-400">Returned</span>
                  )}
                </td>
              </tr>
            ))}
            {borrowings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No borrowing records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal 
        isOpen={modalState.isOpen}
        message={modalState.message}
        onConfirm={closeModal}
        onCancel={closeModal}
      />
    </div>
  );
}
