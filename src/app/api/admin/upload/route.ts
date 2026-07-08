import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    if (!(await isAuthenticated())) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
          return NextResponse.json({ error: "No file" }, { status: 400 });
        }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `artworks/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
        });

    return NextResponse.json({
          url: blob.url,
          filename,
        });
  }
