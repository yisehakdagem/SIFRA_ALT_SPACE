import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { amount, email, firstName, lastName, returnUrl, title, description } = data;
    console.log("Chapa initialize payload:", data);

    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const chapaPayload = {
      amount: amount.toString(),
      currency: "ETB",
      email: (email && !email.endsWith("@sifra.et")) ? email : "testcustomer@gmail.com",
      first_name: firstName || "Customer",
      last_name: lastName || "Sifra",
      tx_ref: tx_ref,
      return_url: returnUrl,
      "customization[title]": title || "Payment",
      "customization[description]": description || "Payment description"
    };
    console.log("Sending to Chapa:", chapaPayload);

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chapaPayload)
    });

    const result = await response.json();
    console.log("Chapa response:", result);

    if (result.status === "success") {
      return NextResponse.json({
        checkout_url: result.data.checkout_url,
        tx_ref: tx_ref
      });
    } else {
      return NextResponse.json({ error: result.message || result.error || "Failed to initialize payment" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Chapa initialize error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
