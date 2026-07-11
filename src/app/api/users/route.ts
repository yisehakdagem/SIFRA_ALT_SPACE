import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "Administrator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getUserFromRequest(req);
    if (!admin || admin.role !== "Administrator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, email, role, password } = await req.json();
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Role: role,
        PasswordHash: hash,
        Status: "Active"
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
