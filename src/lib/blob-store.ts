import { put, del, list } from "@vercel/blob";
import type { Artwork } from "./types";

const METADATA_KEY = "artworks/metadata.json";

export async function getArtworksWithMeta(): Promise<{ artworks: Artwork[]; etag?: string }> {
    try {
          const { blobs } = await list({ prefix: METADATA_KEY });
          if (blobs.length === 0) return { artworks: [] };
          const res = await fetch(blobs[0].url, { cache: "no-store" });
          const data: Artwork[] = await res.json();
          return { artworks: data.sort((a, b) => a.order - b.order), etag: blobs[0].etag };
    } catch {
          return { artworks: [] };
    }
}

export async function getArtworks(): Promise<Artwork[]> {
    const { artworks } = await getArtworksWithMeta();
    return artworks;
}

export async function saveArtworks(artworks: Artwork[], ifMatch?: string): Promise<void> {
    await put(METADATA_KEY, JSON.stringify(artworks, null, 2), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
          ...(ifMatch ? { ifMatch } : {}),
    });
}

export async function uploadImage(
    file: File,
    filename: string
  ): Promise<{ url: string; width: number; height: number }> {
    const blob = await put(`artworks/${filename}`, file, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
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
