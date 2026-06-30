import { put, del, list } from "@vercel/blob";
import type { Artwork } from "./types";

const METADATA_KEY = "artworks/metadata.json";

export async function getArtworks(): Promise<Artwork[]> {
    try {
          const { blobs } = await list({ prefix: METADATA_KEY });
          if (blobs.length === 0) return [];
          const res = await fetch(blobs[0].url, { cache: "no-store" });
          const data: Artwork[] = await res.json();
          return data.sort((a, b) => a.order - b.order);
    } catch {
          return [];
    }
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
    await put(METADATA_KEY, JSON.stringify(artworks, null, 2), {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/json",
    });
}

export async function uploadImage(
    file: File,
    filename: string
  ): Promise<{ url: string; width: number; height: number }> {
    const blob = await put(`artworks/${filename}`, file, {
          access: "public",
          addRandomSuffix: false,
    });
    return { url: blob.url, width: 0, height: 0 };
}

export async function deleteImage(url: string): Promise<void> {
    try {
          await del(url);
    } catch {
          // Image may already be deleted
    }
}

export async function getPublicArtworks(
    type?: "original" | "print"
  ): Promise<Artwork[]> {
    const all = await getArtworks();
    let filtered = all.filter(
          (a) => a.status === "available" || a.status === "sold"
        );
    if (type) filtered = filtered.filter((a) => a.type === type);
    return filtered;
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
    const all = await getArtworks();
    return all.filter(
          (a) => a.featured && (a.status === "available" || a.status === "sold")
        );
}
