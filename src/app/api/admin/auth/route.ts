import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { password } = await req.json();
    if (password === process.env.ADMIN_PASSWORD) {
          const res = NextResponse.json({ ok: true });
          res.cookies.set("admin_token", process.env.ADMIN_PASSWORD!, {
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
