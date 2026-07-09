import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";

export default async function CustomerEventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user: any = await verifyJwt(token as string);

  const registrations = await prisma.eventRegistration.findMany({
    where: { UserID: user.userId },
    include: { Event: true },
    orderBy: { Event: { EventDate: 'desc' } }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-olive mb-8">My Events</h1>
      
      {registrations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
          <Link href="/events" className="px-6 py-2 bg-olive text-white rounded font-bold hover:bg-olive-dark">Browse Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.RegistrationID} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="bg-olive text-white p-4 rounded-lg text-center min-w-[120px]">
                <div className="text-sm uppercase tracking-wider">{reg.Event.EventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="text-3xl font-bold">{reg.Event.EventDate.getDate()}</div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{reg.Event.Title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 font-medium">
                  <span>{reg.Event.StartTime} - {reg.Event.EndTime}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${reg.PaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Payment: {reg.PaymentStatus}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${reg.Event.EventDate >= new Date() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {reg.Event.EventDate >= new Date() ? "Upcoming" : "Past"}
                  </span>
                </div>
              </div>
              
              <div>
                <Link href={`/events/${reg.EventID}`} className="px-6 py-2 border border-gray-200 text-gray-700 rounded font-bold hover:bg-gray-50 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
