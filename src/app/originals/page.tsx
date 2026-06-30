import type { Metadata } from "next";
import Image from "next/image";
import { getPublicArtworks } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Original Paintings",
  description:
    "Browse original paintings by Deona Hawaii Art, inspired by the islands.",
};

export default async function OriginalsPage() {
  const originals = await getPublicArtworks("original");

  return (
    <section className="py-20 px-6 bg-sand-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
            One of a Kind
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-ocean-deep">
            Original Paintings
          </h1>
          <p className="font-body text-ocean mt-4 max-w-lg mx-auto">
            Each piece is an original work, painted by hand and inspired by the beauty of Hawaii.
          </p>
        </div>

        {/* Masonry grid with real aspect ratios */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {originals.map((art) => (
            <div key={art.id} className="break-inside-avoid group">
              <div
                className="relative overflow-hidden bg-sand/30"
                style={{ aspectRatio: `${art.width}/${art.height}` }}
              >
                <Image
                  src={art.imageUrl}
                  alt={art.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {art.status === "sold" && (
                  <div className="absolute top-3 right-3 bg-coral text-pearl text-xs px-3 py-1 uppercase tracking-wider">
                    Sold
                  </div>
                )}
              </div>
              <div className="mt-3 mb-2">
                <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-ocean-deep/60 mt-1">
                  {art.medium && <span>{art.medium}</span>}
                  {art.medium && art.size && <span>{"·"}</span>}
                  {art.size && <span>{art.size}</span>}
                </div>
                {art.price ? (
                  <p className="text-turquoise text-sm mt-1">
                    ${art.price.toLocaleString()}
                  </p>
                ) : null}
                {art.description && (
                  <p className="text-ocean-deep/50 text-sm mt-2 leading-relaxed">
                    {art.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {originals.length === 0 && (
          <p className="text-center text-ocean-deep/50 text-lg mt-12">
            New originals coming soon.
          </p>
        )}
      </div>
    </section>
  );
}

