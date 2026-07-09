import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import Link from "next/link";
import RegisterButton from "./RegisterButton";

export default async function EventDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tx_ref?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let user: any = null;
  if (token) {
    user = await verifyJwt(token);
  }

  // Handle Return from Chapa
  if (resolvedSearchParams.tx_ref && user) {
    try {
      const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${resolvedSearchParams.tx_ref}`, {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
        cache: 'no-store'
      });
      const verifyData = await verifyRes.json();
      console.log("Chapa Verify Status HTTP:", verifyRes.status);
      console.log("Chapa Verify Data:", verifyData);
      
      if (verifyData.status === "success") {
        await prisma.eventRegistration.upsert({
          where: { EventID_UserID: { EventID: resolvedParams.id, UserID: user.userId } },
          update: { Status: "Registered", PaymentStatus: "Paid" },
          create: { EventID: resolvedParams.id, UserID: user.userId, PaymentStatus: "Paid" }
        });
      }
    } catch (e) {
      console.error("Payment verification failed", e);
    }
  }
  
  const event = await prisma.event.findUnique({
    where: { EventID: resolvedParams.id },
    include: {
      Registrations: true
    }
  });

  if (!event) notFound();



  const isRegistered = user ? event.Registrations.some(r => r.UserID === user.userId && r.Status === "Registered") : false;
  const isFull = event.MaxParticipants > 0 && event.Registrations.filter(r => r.Status === "Registered").length >= event.MaxParticipants;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/events" className="text-olive hover:text-gold-light mb-8 inline-block font-semibold">
        Back to Events
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-olive text-white p-8 md:p-12 text-center">
          <div className="text-gold font-semibold uppercase tracking-widest text-sm mb-4">
            {event.EventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            {event.Title}
          </h1>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
            <span>{event.StartTime} - {event.EndTime}</span>
          </div>
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-serif font-bold text-dark">About this Event</h3>
            <span className="bg-gold/20 text-gold-dark px-4 py-1 rounded-full font-bold">
              {event.Price > 0 ? `${event.Price} ETB` : "Free"}
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-12 whitespace-pre-wrap">
            {event.Description || "No description provided."}
          </p>

          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-gray-500 text-sm">
              {event.MaxParticipants > 0 ? (
                <span>
                  <strong>{event.Registrations.filter(r => r.Status === "Registered").length}</strong> / {event.MaxParticipants} spots filled
                </span>
              ) : (
                <span>Unlimited seating</span>
              )}
            </div>

            <div>
              {!user ? (
                <Link href="/login" className="inline-block px-8 py-3 bg-beige text-dark font-bold rounded-lg hover:bg-gold transition-colors shadow-sm">
                  Log in to Register
                </Link>
              ) : (user.role === 'Administrator' || user.role === 'Manager') ? (
                <span className="inline-block px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-lg border border-gray-200">
                  Staff cannot register
                </span>
              ) : isFull && !isRegistered ? (
                <span className="inline-block px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-lg">
                  Event Full
                </span>
              ) : (
                <RegisterButton eventId={event.EventID} isRegistered={isRegistered} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
