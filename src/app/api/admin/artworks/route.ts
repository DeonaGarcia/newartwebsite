import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArtworks, saveArtworks, deleteImage } from "@/lib/blob-store";
import type { Artwork } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
    if (!(await isAuthenticated())) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    const artworks = await getArtworks();
    return NextResponse.json(artworks);
  }

export async function POST(req: NextRequest) {
    if (!(await isAuthenticated())) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    const body = await req.json();
    const artworks = await getArtworks();

    if (body.action === "update") {
          const idx = artworks.findIndex((a: Artwork) => a.id === body.artwork.id);
          if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
          artworks[idx] = { ...artworks[idx], ...body.artwork, updatedAt: new Date().toISOString() };
          await saveArtworks(artworks);
          return NextResponse.json(artworks[idx]);
        }

    if (body.action === "delete") {
          const idx = artworks.findIndex((a: Artwork) => a.id === body.id);
          if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
          const removed = artworks.splice(idx, 1)[0];
          if (removed.imageUrl) await deleteImage(removed.imageUrl);
          await saveArtworks(artworks);
          return NextResponse.json({ ok: true });
        }

    if (body.action === "reorder") {
          const reordered = body.ids.map((id: string, i: number) => {
                  const art = artworks.find((a: Artwork) => a.id === id);
                  if (art) art.order = i;
                  return art;
                }).filter(Boolean) as Artwork[];
          await saveArtworks(reordered);
          return NextResponse.json({ ok: true });
        }

    if (body.action === "add") {
          const now = new Date().toISOString();
          const newArt: Artwork = {
                  id: `art-${Date.now()}`,
                  title: body.title || "Untitled",
                  imageUrl: body.imageUrl || "",
                  width: body.width || 2000,
                  height: body.height || 1500,
                  type: body.type || "original",
                  size: body.size || "",
                  medium: body.medium || "",
                  price: body.price || 0,
                  description: body.description || "",
                  status: body.status || "available",
                  featured: body.featured || false,
                  order: artworks.length,
                  createdAt: now,
                  updatedAt: now,
                };
          artworks.push(newArt);
          await saveArtworks(artworks);
          return NextResponse.json(newArt);
        }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
