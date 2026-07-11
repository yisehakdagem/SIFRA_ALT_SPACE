"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function AddEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", description: "", date: "", startTime: "", endTime: "", maxParticipants: "0", price: "0"
  });
  const [modalState, setModalState] = useState({ isOpen: false, message: "" });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) router.push("/manager/events");
    else {
      const data = await res.json();
      setModalState({ isOpen: true, message: data.error || "Error creating event" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Title</label>
          <input required type="text" value={formData.title} className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input required type="date" value={formData.date} className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input required type="time" value={formData.startTime} className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, startTime: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input required type="time" value={formData.endTime} className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, endTime: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Participants (0 for unlimited)</label>
            <input type="number" min="0" value={formData.maxParticipants} className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, maxParticipants: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Price (ETB, 0 for free)</label>
            <input type="number" min="0" step="0.01" value={formData.price} required className="mt-1 w-full p-2 border rounded" onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={formData.description} className="mt-1 w-full p-2 border rounded" rows={4} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-olive text-white rounded hover:bg-olive-dark">Save Event</button>
        </div>
      </form>
      <Modal 
        isOpen={modalState.isOpen}
        message={modalState.message}
        onConfirm={closeModal}
        onCancel={closeModal}
      />
    </div>
  );
}
