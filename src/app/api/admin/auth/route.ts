import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getExpectedToken(): string {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD!)
    .update("admin-session-v1")
    .digest("hex");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", getExpectedToken(), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
}
