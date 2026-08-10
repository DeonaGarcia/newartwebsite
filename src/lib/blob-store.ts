import { put, del, list } from "@vercel/blob";
import type { Artwork } from "./types";
import { artworks as staticArtworks } from "./artworks";

const METADATA_KEY = "artworks/metadata.json";
const BACKUPS_PREFIX = "artworks/backups/";

function fallbackArtworks(): Artwork[] {
  const now = new Date().toISOString();
  return staticArtworks.map((a, i) => ({
    id: a.id,
    title: a.title,
    imageUrl: `/art/${a.file}`,
    width: a.width,
    height: a.height,
    type: a.type,
    status: "available" as const,
    featured: a.featured || false,
    order: i,
    createdAt: now,
    updatedAt: now,
  }));
}

export async function getArtworksWithMeta(): Promise<{ artworks: Artwork[]; etag?: string }> {
  try {
    const { blobs } = await list({ prefix: METADATA_KEY });
    if (blobs.length === 0) return { artworks: fallbackArtworks() };
    // Cache-bust with the blob's own upload timestamp so a stale CDN edge
    // can never serve last save's content after a new save just happened.
    const bustUrl = `${blobs[0].url}?v=${blobs[0].uploadedAt.getTime()}`;
    const res = await fetch(bustUrl, { cache: "no-store" });
    const data: Artwork[] = await res.json();
    if (!data || data.length === 0) return { artworks: fallbackArtworks() };
    return { artworks: data.sort((a, b) => a.order - b.order), etag: blobs[0].etag };
  } catch {
    return { artworks: fallbackArtworks() };
  }
}

export async function getArtworks(): Promise<Artwork[]> {
  const { artworks } = await getArtworksWithMeta();
  return artworks;
}

export async function saveArtworks(artworks: Artwork[], ifMatch?: string): Promise<void> {
  // Snapshot whatever is currently live before overwriting it, so a bad
  // save (wrong price, wiped title, accidental delete) is recoverable.
  // Best-effort only — a backup failure must never block the real save.
  try {
    const { blobs } = await list({ prefix: METADATA_KEY });
    if (blobs.length > 0) {
      const bustUrl = `${blobs[0].url}?v=${blobs[0].uploadedAt.getTime()}`;
      const res = await fetch(bustUrl, { cache: "no-store" });
      const previous = await res.text();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await put(`${BACKUPS_PREFIX}${timestamp}.json`, previous, {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
    }
  } catch {
    // Ignore — backup is a safety net, not a requirement for saving.
  }

  await put(METADATA_KEY, JSON.stringify(artworks, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    ...(ifMatch ? { ifMatch } : {}),
  });
}

export async function listArtworkBackups(): Promise<
  { pathname: string; uploadedAt: Date; url: string }[]
> {
  const { blobs } = await list({ prefix: BACKUPS_PREFIX });
  return blobs
    .map((b) => ({ pathname: b.pathname, uploadedAt: b.uploadedAt, url: b.url }))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

export async function restoreArtworkBackup(pathname: string): Promise<void> {
  const { blobs } = await list({ prefix: BACKUPS_PREFIX });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) throw new Error(`Backup not found: ${pathname}`);
  const bustUrl = `${match.url}?v=${match.uploadedAt.getTime()}`;
  const res = await fetch(bustUrl, { cache: "no-store" });
  const data = await res.text();
  await put(METADATA_KEY, data, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
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
