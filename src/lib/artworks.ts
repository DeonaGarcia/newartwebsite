/**
 * Artwork data — central source of truth for gallery content.
 *
 * HOW TO ADD NEW ART:
 * 1. Drop your image into /public/art/
 * 2. Add an entry here with the filename
 * 3. Push to GitHub — Vercel auto-deploys, Next.js auto-optimizes the image
 */

export interface Artwork {
  id: string;
  title: string;
  file: string;
  featured?: boolean;
}

export const artworks: Artwork[] = [
  { id: "kealakekua-bay", title: "Kealakekua Bay", file: "kealakekua-bay.jpg", featured: true },
  { id: "ode-to-the-big-island", title: "Ode to the Big Island", file: "ode-to-the-big-island.jpg", featured: true },
  { id: "volcano", title: "Volcano", file: "volcano.jpg", featured: true },
  { id: "ga-3645", title: "Island Light", file: "GA_3645.jpg" },
  { id: "ga-3631", title: "Hawaiian Shores", file: "GA_3631.jpg" },
  { id: "img-0588", title: "Ocean View", file: "IMG_0588.jpg" },
  { id: "img-0584", title: "Island Morning", file: "IMG_0584_imsg.jpg" },
  { id: "img-0576", title: "Coastal Waters", file: "IMG_0576_imsg.jpg" },
  { id: "img-0625", title: "Tropical Sunset", file: "IMG_0625.jpg" },
  { id: "img-0626", title: "Island Breeze", file: "IMG_0626.jpg" },
  { id: "img-0627", title: "Pacific Blue", file: "IMG_0627.jpg" },
  { id: "img-0628", title: "Shoreline", file: "IMG_0628.jpg" },
  { id: "img-2345", title: "Island Palette", file: "IMG_2345.jpg" },
  { id: "img-2347", title: "Island Colors", file: "IMG_2347.jpg" },
  { id: "img-2638", title: "Horizon", file: "IMG_2638.jpg" },
  { id: "img-0452", title: "Sea & Sky", file: "IMG_0452.jpg" },
  { id: "img-0600", title: "Island Garden", file: "IMG_0600.jpg" },
  { id: "img-1189", title: "Tropical Study", file: "IMG_1189.jpg" },
  { id: "img-1223", title: "Island Flora", file: "IMG_1223.jpg" },
  { id: "img-1229", title: "Morning Light", file: "IMG_1229.jpg" },
  { id: "img-0389", title: "Island Scene I", file: "IMG_0389.jpg" },
  { id: "img-0393", title: "Island Scene II", file: "IMG_0393.jpg" },
  { id: "img-0394", title: "Island Scene III", file: "IMG_0394.jpg" },
  { id: "img-0412", title: "Island Scene IV", file: "IMG_0412.jpg" },
  { id: "img-0586", title: "Wave Study", file: "IMG_0586.jpg" },
  { id: "dscf-1104", title: "Island Sketch", file: "DSCF1104.jpg" },
  { id: "img-5839", title: "Small Study I", file: "IMG_5839.jpg" },
  { id: "img-7772", title: "Small Study II", file: "IMG_7772.jpg" },
];

export function getFeaturedArtworks(): Artwork[] {
  return artworks.filter((a) => a.featured);
}
