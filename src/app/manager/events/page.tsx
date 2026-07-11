"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Event = {
  EventID: string;
  Title: string;
  Status: string;
  Hidden: boolean;
  EventDate: Date;
  StartTime: string;
  EndTime: string;
  MaxParticipants: number;
  Registrations: Array<{ Status: string }>;
};

export default function EventManagementPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const handleToggleHide = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "PATCH" });
      if (res.ok) {
        const updatedEvent = await res.json();
        setEvents(events.map((e) =>
          e.EventID === updatedEvent.EventID ? updatedEvent : e
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse bg-gray-200 h-10 w-1/3 rounded mb-8"></div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-gray-200 p-6">
              <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-3 w-1/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Event Management</h1>
        <Link href="/manager/events/add" className="bg-olive text-white px-4 py-2 rounded font-semibold hover:bg-olive-dark">
          + Create Event
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => {
              const activeRegs = (event.Registrations || []).filter(r => r.Status === "Registered").length;
              return (
                <tr key={event.EventID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{new Date(event.EventDate).toLocaleDateString()}</div>
                    <div className="text-gray-500">{event.StartTime} - {event.EndTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2 items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-beige text-olive-dark">
                        {event.Status}
                      </span>
                      {event.Hidden && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeRegs} / {event.MaxParticipants > 0 ? event.MaxParticipants : 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <Link href={`/manager/events/${event.EventID}`} className="text-olive hover:text-olive-dark">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleHide(event.EventID)}
                      className="text-gray-600 hover:text-gray-800">
                      {event.Hidden ? "Unhide" : "Hide"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
