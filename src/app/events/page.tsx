import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { EventDate: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-olive mb-8">Upcoming Events</h1>
      
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.EventID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-olive text-white p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-sm uppercase tracking-wider">{event.EventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
              <div className="text-3xl font-bold">{event.EventDate.getDate()}</div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{event.Title}</h3>
              <p className="text-gray-600 mt-2">{event.Description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 font-medium">
                <span>{event.StartTime} - {event.EndTime}</span>
              </div>
            </div>
            
            <div>
              <Link href={`/events/${event.EventID}`} className="inline-block px-6 py-2 bg-beige text-dark font-semibold rounded hover:bg-gold transition-colors">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
