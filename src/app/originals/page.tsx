import type { Metadata } from "next";
import Image from "next/image";
import { getOriginals } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Original Paintings",
  description:
    "Browse original paintings by Deona Hawaii Art, inspired by the islands.",
};

export default function OriginalsPage() {
  const originals = getOriginals();

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

        {originals.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {originals.map((art) => (
              <div key={art.id} className="break-inside-avoid group">
                <div className="relative overflow-hidden bg-sand/30">
                  <Image
                    src={`/art/${art.file}`}
                    alt={art.title}
                    width={art.width}
                    height={art.height}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-3 mb-2">
                  <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-ocean-deep/50 text-lg mt-12">
            New originals coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
