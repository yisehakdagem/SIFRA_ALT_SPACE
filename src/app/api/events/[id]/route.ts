import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    const isStaff = user?.role === "Manager" || user?.role === "Administrator";
    
    const event = await prisma.event.findUnique({
      where: { EventID: id },
      include: {
        Registrations: { include: { User: true } }
      }
    });
    
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isStaff && event.Hidden) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const event = await prisma.event.update({
      where: { EventID: id },
      data: {
        Title: data.title,
        Description: data.description,
        EventDate: new Date(data.date),
        StartTime: data.startTime,
        EndTime: data.endTime,
        MaxParticipants: parseInt(data.maxParticipants) || 0,
        Status: data.status,
        Price: parseFloat(data.price) || 0,
        Hidden: data.hidden !== undefined ? data.hidden : undefined,
      }
    });
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const currentEvent = await prisma.event.findUnique({
      where: { EventID: id },
    });
    
    if (!currentEvent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const updatedEvent = await prisma.event.update({
      where: { EventID: id },
      data: { Hidden: !currentEvent.Hidden },
      include: { Registrations: true }, // include registrations here!
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== "Manager" && user.role !== "Administrator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.event.delete({ where: { EventID: id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
