import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, loginType } = await req.json();

    const user = await prisma.user.findUnique({ where: { Email: email } });
    if (!user || user.Status !== "Active") {
      return NextResponse.json({ error: "Invalid credentials or inactive account" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (loginType === "customer" && user.Role !== "Customer") {
      return NextResponse.json({ error: "Staff members must use the secure staff login portal." }, { status: 403 });
    }

    if (loginType === "staff" && user.Role === "Customer") {
      return NextResponse.json({ error: "Access Denied. You are not an authorized staff member." }, { status: 403 });
    }

    // Create JWT
    const token = await signJwt({
      userId: user.UserID,
      email: user.Email,
      role: user.Role,
      name: `${user.FirstName} ${user.LastName}`
    });

    const response = NextResponse.json({
      message: "Logged in",
      user: {
        id: user.UserID,
        email: user.Email,
        role: user.Role,
        name: `${user.FirstName} ${user.LastName}`
      }
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Must be lax so payment gateway redirects carry the auth cookie
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
