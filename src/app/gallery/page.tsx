import type { Metadata } from "next";
import Image from "next/image";
import { artworks } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse original paintings and fine art prints by Deona Hawaii, inspired by the islands.",
};

export default function GalleryPage() {
  return (
    <section className="py-20 px-6 bg-sand-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
            Original Works
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-ocean-deep">
            Gallery
          </h1>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {artworks.map((art, i) => {
            const aspects = ["aspect-[4/5]", "aspect-[3/4]", "aspect-[5/6]", "aspect-[4/3]"];
            const aspect = aspects[i % aspects.length];

            return (
              <div
                key={art.id}
                className="break-inside-avoid group cursor-pointer"
              >
                <div className={`${aspect} relative overflow-hidden bg-ocean-foam`}>
                  <Image
                    src={`/art/${art.file}`}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 mb-2">
                  <p className="font-heading text-xl text-ocean-deep group-hover:text-turquoise-deep transition-colors duration-200">
                    {art.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
