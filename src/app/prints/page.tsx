import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicArtworks } from "@/lib/blob-store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FreeShippingTag } from "@/components/shipping/FreeShippingBadge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Art Prints",
  description:
    "Shop fine art prints by Deona Hawaii Art, reproductions of original paintings inspired by the islands.",
};

export default async function PrintsPage() {
  const prints = await getPublicArtworks("print");

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
              <div key={art.id} className="break-inside-avoid group">
                <div
                  className="relative overflow-hidden bg-sand/30"
                  style={{ aspectRatio: art.width + "/" + art.height }}
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
                <div className="mt-3 mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-ocean-deep/60 mt-1">
                      {art.medium && <span>{art.medium}</span>}
                      {art.medium && art.size && <span>&middot;</span>}
                      {art.size && <span>{art.size}</span>}
                    </div>
                    {art.price ? (
                      <p className="text-turquoise text-sm mt-1 flex items-center gap-2">
                        <span>{'$'}{(art.price / 100).toLocaleString()}</span>
                        {art.freeShipping && <FreeShippingTag />}
                      </p>
                    ) : null}
                    {art.description && (
                      <p className="text-ocean-deep/50 text-sm mt-2 leading-relaxed">
                        {art.description}
                      </p>
                    )}
                  </div>
                  <AddToCartButton productId={art.id} type="print" disabled={art.status !== "available"} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-ocean-deep/50 text-lg mb-4">
              Prints coming soon.
            </p>
            <Link
              href="/originals"
              className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all duration-300"
            >
              Browse Originals
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
