import type { Metadata } from "next";
import Link from "next/link";
import { getPrints } from "@/lib/artworks";
import Image from "next/image";

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
            High-quality prints of original paintings, available in multiple sizes.
          </p>
        </div>

        {prints.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {prints.map((art) => (
              <div
                key={art.id}
                className="break-inside-avoid group cursor-pointer"
              >
                <div
                  className="relative overflow-hidden bg-ocean-foam rounded-sm shadow-sm"
                  style={{ aspectRatio: `${art.width}/${art.height}` }}
                >
                  <Image
                    src={`/art/${art.file}`}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 mb-2">
                  <p className="font-heading text-xl text-ocean-deep group-hover:text-turquoise-deep transition-colors duration-200">
                    {art.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-sand rounded-sm">
            <p className="font-heading text-3xl text-ocean-deep mb-4">
              Coming Soon
            </p>
            <p className="font-body text-ocean max-w-md mx-auto mb-8">
              Fine art prints will be available here soon. In the meantime, browse the original paintings.
            </p>
            <Link
              href="/originals"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] px-10 py-4 bg-turquoise-deep text-pearl hover:bg-ocean-deep transition-colors duration-200 cursor-pointer"
            >
              View Originals
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
