import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    const isStaff = user?.role === "Manager" || user?.role === "Administrator";
    
    const events = await prisma.event.findMany({
      where: isStaff ? {} : { Hidden: false },
      include: {
        Registrations: true
      },
      orderBy: { EventDate: 'asc' }
    });
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const event = await prisma.event.create({
      data: {
        Title: data.title,
        Description: data.description,
        EventDate: new Date(data.date),
        StartTime: data.startTime,
        EndTime: data.endTime,
        Price: parseFloat(data.price) || 0,
        MaxParticipants: parseInt(data.maxParticipants) || 0,
        Status: data.status || "Upcoming",
        CreatedByID: user.userId as string,
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
