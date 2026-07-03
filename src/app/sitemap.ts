import type { MetadataRoute } from "next";

const BASE_URL = "https://deonahawaiiart.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/gallery", "/originals", "/prints", "/about", "/contact"];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}

