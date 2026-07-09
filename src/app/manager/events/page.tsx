import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EventManagementPage() {
  const events = await prisma.event.findMany({
    orderBy: { EventDate: "asc" },
    include: { Registrations: true }
  });

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => {
              const activeRegs = event.Registrations.filter(r => r.Status === "Registered").length;
              return (
                <tr key={event.EventID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{event.EventDate.toLocaleDateString()}</div>
                    <div className="text-gray-500">{event.StartTime} - {event.EndTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-beige text-olive-dark">
                      {event.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeRegs} / {event.MaxParticipants > 0 ? event.MaxParticipants : 'Unlimited'}
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
