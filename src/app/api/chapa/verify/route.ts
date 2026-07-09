import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref");

    if (!tx_ref) {
      return NextResponse.json({ error: "tx_ref is required" }, { status: 400 });
    }

    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    const result = await response.json();

    if (result.status === "success") {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
