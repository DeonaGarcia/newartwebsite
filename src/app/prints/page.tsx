import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPrints } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Art Prints",
  description:
    "Shop fine art prints by Deona Hawaii Art. High-quality reproductions of original paintings.",
};

export default function PrintsPage() {
  const prints = getPrints();

  return (
    <section className="py-20 px-6 bg-sand-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
            Fine Art Reproductions
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-ocean-deep">
            Art Prints
          </h1>
          <p className="font-body text-ocean mt-4 max-w-lg mx-auto">
            High-quality prints of original paintings, available in multiple
            sizes.
          </p>
        </div>

        {prints.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {prints.map((art) => (
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
                  <h3 className="text-ocean-deep font-light text-lg">
                    {art.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <p className="text-ocean-deep/50 text-lg mb-6">
              Prints coming soon.
            </p>
            <Link
              href="/originals"
              className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all duration-300"
            >
              View Original Paintings
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
