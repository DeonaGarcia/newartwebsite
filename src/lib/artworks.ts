/**
 * Artwork data — central source of truth for gallery content.
 * Each entry includes actual image dimensions for correct aspect ratios.
 * type: "original" or "print" determines which gallery page it appears on.
 */

export interface Artwork {
  id: string;
  title: string;
  file: string;
  width: number;
  height: number;
  type: "original" | "print";
  featured?: boolean;
}

export const artworks: Artwork[] = [
  { id: "kealakekua-bay", title: "Kealakekua Bay", file: "kealakekua-bay.jpg", width: 2000, height: 1466, type: "original", featured: true },
  { id: "ode-to-the-big-island", title: "Ode to the Big Island", file: "ode-to-the-big-island.jpg", width: 2000, height: 1495, type: "original", featured: true },
  { id: "volcano", title: "Volcano", file: "volcano.jpg", width: 2000, height: 1500, type: "original", featured: true },
  { id: "ga-3645", title: "Island Light", file: "GA_3645.jpg", width: 2000, height: 1500, type: "original" },
  { id: "ga-3631", title: "Hawaiian Shores", file: "GA_3631.jpg", width: 2000, height: 1466, type: "original" },
  { id: "img-0588", title: "Ocean View", file: "IMG_0588.jpg", width: 2000, height: 1484, type: "original" },
  { id: "img-0576", title: "Coastal Waters", file: "IMG_0576_imsg.jpg", width: 2000, height: 1498, type: "original" },
  { id: "img-0626", title: "Island Breeze", file: "IMG_0626.jpg", width: 1299, height: 2000, type: "original" },
  { id: "img-0627", title: "Pacific Blue", file: "IMG_0627.jpg", width: 1317, height: 2000, type: "original" },
  { id: "img-0628", title: "Shoreline", file: "IMG_0628.jpg", width: 1319, height: 2000, type: "original" },
  { id: "img-2345", title: "Island Palette", file: "IMG_2345.jpg", width: 2000, height: 1501, type: "original" },
  { id: "img-2347", title: "Island Colors", file: "IMG_2347.jpg", width: 2000, height: 1499, type: "original" },
  { id: "img-0452", title: "Sea & Sky", file: "IMG_0452.jpg", width: 2000, height: 1493, type: "original" },
  { id: "img-1189", title: "Tropical Study", file: "IMG_1189.jpg", width: 2000, height: 1511, type: "original" },
  { id: "img-1223", title: "Island Flora", file: "IMG_1223.jpg", width: 2000, height: 1626, type: "original" },
  { id: "img-1229", title: "Morning Light", file: "IMG_1229.jpg", width: 2000, height: 1500, type: "original" },
  { id: "img-0389", title: "Island Scene I", file: "IMG_0389.jpg", width: 2000, height: 1505, type: "original" },
  { id: "img-0393", title: "Island Scene II", file: "IMG_0393.jpg", width: 986, height: 2000, type: "original" },
  { id: "img-0412", title: "Island Scene IV", file: "IMG_0412.jpg", width: 1294, height: 2000, type: "original" },
  { id: "img-0586", title: "Wave Study", file: "IMG_0586.jpg", width: 2000, height: 1333, type: "original" },
  { id: "dscf-1104", title: "Island Sketch", file: "DSCF1104.jpg", width: 2000, height: 1500, type: "print" },
];

export function getFeaturedArtworks(): Artwork[] {
  return artworks.filter((a) => a.featured);
}

export function getOriginals(): Artwork[] {
  return artworks.filter((a) => a.type === "original");
}

export function getPrints(): Artwork[] {
  return artworks.filter((a) => a.type === "print");
}
