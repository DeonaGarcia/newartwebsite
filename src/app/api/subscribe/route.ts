import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RESEND_CONTACTS_URL = "https://api.resend.com/contacts";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — cannot save subscriber");
    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 500 });
  }

  try {
    const res = await fetch(RESEND_CONTACTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const errBody = await res.text();
    // Resend rejects duplicates -- treat that as a success from the
    // visitor's point of view, they're already on the list either way.
    if (res.status === 409 || /already exists|duplicate/i.test(errBody)) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    console.error(`Resend contacts API error (${res.status}):`, errBody);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  } catch (err) {
    console.error("Failed to reach Resend contacts API:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
}

