import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, password, address } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { Email: email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Automatically assign Role = Customer as per requirements
    const user = await prisma.user.create({
      data: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone || null,
        PasswordHash: passwordHash,
        Role: "Customer",
        Address: address || null,
      },
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
