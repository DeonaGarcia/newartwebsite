import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArtworksWithMeta, saveArtworks, deleteImage } from "@/lib/blob-store";
import { BlobPreconditionFailedError } from "@vercel/blob";
import type { Artwork } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Parses the first two numbers out of a freeform size string like
 * `24" x 36"`, `24 x 36 in`, or `24x36` — used to auto-detect which
 * artworks qualify for free shipping by physical size.
 */
function parseSizeInches(size?: string): [number, number] | null {
  if (!size) return null;
  const nums = size.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const [a, b] = nums.map(Number);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return [a, b];
}

/** True if the (unordered) pair of dimensions fits within maxA x maxB, in either orientation. */
function fitsWithin(dims: [number, number], maxA: number, maxB: number): boolean {
  const [small, large] = [...dims].sort((a, b) => a - b);
  const [maxSmall, maxLarge] = [maxA, maxB].sort((a, b) => a - b);
  return small <= maxSmall && large <= maxLarge;
}


export async function GET() {
    if (!(await isAuthenticated())) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    const { artworks } = await getArtworksWithMeta();
    return NextResponse.json(artworks);
  }

/**
 * Reads the current artworks + etag, applies `mutate`, and saves with an
 * ifMatch conditional write. If another request wrote in between (etag
 * mismatch), re-reads fresh data and retries -- prevents one save from
 * silently clobbering another concurrent save (lost-update race).
 */
async function withRetry<T>(
  mutate: (artworks: Artwork[]) => { artworks: Artwork[]; result: T } | null,
  maxAttempts = 5
): Promise<T | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { artworks, etag } = await getArtworksWithMeta();
    const outcome = mutate(artworks);
    if (outcome === null) return null;
    try {
      await saveArtworks(outcome.artworks, etag);
      return outcome.result;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError && attempt < maxAttempts - 1) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed to save artworks after retries");
}

export async function POST(req: NextRequest) {
    if (!(await isAuthenticated())) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    const body = await req.json();

    if (body.action === "update") {
          const updated = await withRetry<Artwork>((artworks) => {
                const idx = artworks.findIndex((a: Artwork) => a.id === body.artwork.id);
                if (idx === -1) return null;
                artworks[idx] = { ...artworks[idx], ...body.artwork, updatedAt: new Date().toISOString() };
                return { artworks, result: artworks[idx] };
              });
          if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
          return NextResponse.json(updated);
        }

    if (body.action === "delete") {
          const removed = await withRetry<Artwork>((artworks) => {
                const idx = artworks.findIndex((a: Artwork) => a.id === body.id);
                if (idx === -1) return null;
                const removedItem = artworks.splice(idx, 1)[0];
                return { artworks, result: removedItem };
              });
          if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
          if (removed.imageUrl) await deleteImage(removed.imageUrl);
          return NextResponse.json({ ok: true });
        }

    if (body.action === "reorder") {
          await withRetry<boolean>((artworks) => {
                const reordered = body.ids.map((id: string, i: number) => {
                        const art = artworks.find((a: Artwork) => a.id === id);
                        if (art) art.order = i;
                        return art;
                      }).filter(Boolean) as Artwork[];
                return { artworks: reordered, result: true };
              });
          return NextResponse.json({ ok: true });
        }

    if (body.action === "add") {
          const newArt = await withRetry<Artwork>((artworks) => {
                const now = new Date().toISOString();
                const art: Artwork = {
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
                artworks.push(art);
                return { artworks, result: art };
              });
          return NextResponse.json(newArt);
        }

    if (body.action === "applyFreeShipping") {
          const maxA = typeof body.maxWidthIn === "number" ? body.maxWidthIn : 24;
          const maxB = typeof body.maxHeightIn === "number" ? body.maxHeightIn : 28;
          let count = 0;
          await withRetry<number>((artworks) => {
                count = 0;
                for (const art of artworks) {
                      const dims = parseSizeInches(art.size);
                      const eligible = dims ? fitsWithin(dims, maxA, maxB) : false;
                      art.freeShipping = eligible;
                      if (eligible) count++;
                    }
                return { artworks, result: count };
              });
          return NextResponse.json({ ok: true, count, maxWidthIn: maxA, maxHeightIn: maxB });
        }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
