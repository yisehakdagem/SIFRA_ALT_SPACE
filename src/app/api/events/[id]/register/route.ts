import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const eventId = id;
    const userId = user.userId as string;
    const { returnUrl } = await request.json();

    const event = await prisma.event.findUnique({
      where: { EventID: eventId },
      include: { Registrations: true }
    });

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const registeredCount = event.Registrations.filter(r => r.Status === "Registered").length;
    if (event.MaxParticipants > 0 && registeredCount >= event.MaxParticipants) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    const existing = event.Registrations.find(r => r.UserID === userId);
    if (existing && existing.Status === "Registered") {
       return NextResponse.json({ error: "Already registered" }, { status: 400 });
    }

    if (event.Price > 0) {
      const tx_ref = `TX-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.CHAPA_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: event.Price.toString(),
          currency: "ETB",
          email: (typeof user.email === "string" && !user.email.endsWith("@sifra.et")) ? user.email : "testcustomer@gmail.com",
          first_name: user.name || "Customer",
          last_name: "Sifra",
          tx_ref: tx_ref,
          return_url: `${returnUrl}?tx_ref=${tx_ref}`,
          "customization[title]": `Registration for ${event.Title}`,
        })
      });

      const result = await response.json();
      if (result.status === "success") {
        return NextResponse.json({ requiresPayment: true, checkout_url: result.data.checkout_url, tx_ref });
      } else {
        return NextResponse.json({ error: "Payment gateway error" }, { status: 400 });
      }
    } else {
      const registration = await prisma.eventRegistration.upsert({
        where: { EventID_UserID: { EventID: eventId, UserID: userId } },
        update: { Status: "Registered", PaymentStatus: "Paid" },
        create: { EventID: eventId, UserID: userId, PaymentStatus: "Paid" }
      });
      return NextResponse.json({ requiresPayment: false, registration }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const eventId = id;
    const userId = user.userId as string;

    await prisma.eventRegistration.deleteMany({
      where: { EventID: eventId, UserID: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
