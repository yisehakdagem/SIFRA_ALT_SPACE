import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const user: any = await verifyJwt(token);
  if (!user) return null;

  const [activeBorrowings, wishlistCount, nextEvent] = await Promise.all([
    prisma.borrowing.count({
      where: { UserID: user.userId, Status: "Active" }
    }),
    prisma.wishlist.count({
      where: { UserID: user.userId }
    }),
    prisma.eventRegistration.findFirst({
      where: { UserID: user.userId, Event: { EventDate: { gte: new Date() } } },
      include: { Event: true },
      orderBy: { Event: { EventDate: 'asc' } }
    })
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-olive mb-2">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here is an overview of your account activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/customer/borrowings" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="text-4xl mb-4 group-hover:-translate-y-1 transition-transform"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Active Borrowings</h3>
          <p className="text-3xl font-bold text-olive">{activeBorrowings}</p>
        </Link>
        
        <Link href="/customer/wishlist" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="text-4xl mb-4 group-hover:-translate-y-1 transition-transform">️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Wishlisted Books</h3>
          <p className="text-3xl font-bold text-olive">{wishlistCount}</p>
        </Link>

        <Link href="/customer/events" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="text-4xl mb-4 group-hover:-translate-y-1 transition-transform">️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Next Event</h3>
          <p className="text-lg font-bold text-olive">
            {nextEvent ? nextEvent.Event.Title : "No upcoming events"}
          </p>
        </Link>
      </div>
      
      {nextEvent && (
        <div className="bg-gold/10 border border-gold/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-sm font-bold text-gold-dark mb-1 uppercase tracking-wider">Upcoming Event Reminder</div>
            <h4 className="text-xl font-bold text-gray-900">{nextEvent.Event.Title}</h4>
            <p className="text-gray-600 text-sm mt-1">
              {nextEvent.Event.EventDate.toLocaleDateString()} at {nextEvent.Event.StartTime}
            </p>
          </div>
          <Link href={`/events/${nextEvent.EventID}`} className="px-6 py-2 bg-gold text-dark font-bold rounded-lg hover:bg-gold-light transition-colors whitespace-nowrap">
            View Details
          </Link>
        </div>
      )}
    </div>
  );
}
