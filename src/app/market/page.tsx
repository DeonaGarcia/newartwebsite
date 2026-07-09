import Link from "next/link";
import Image from "next/image";
import { getPublicArtworks } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const artworks = await getPublicArtworks();

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-50 bg-ocean-deep px-4 py-3 flex items-center justify-center gap-3 flex-wrap">
        <a
          href="https://venmo.com/Deona-Garcia"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-turquoise text-ocean-deep text-sm font-semibold uppercase tracking-widest py-2.5 px-6 hover:bg-turquoise-deep transition-all duration-300"
        >
          Pay with Venmo
        </a>
        <Link
          href="/originals"
          className="border border-pearl/40 text-pearl text-sm font-semibold uppercase tracking-widest py-2.5 px-6 hover:bg-pearl hover:text-ocean-deep transition-all duration-300"
        >
          Shop the Gallery
        </Link>
      </div>

      {/* Hero */}
      <section className="bg-ocean-deep px-6 pt-12 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-pearl tracking-wide mb-3">
          Original Art & Prints
        </h1>
        <p className="text-lg text-pearl/80 font-light max-w-xl mx-auto">
          Buying in person? Tap Pay with Venmo above. Shopping from home?
          Tap Shop the Gallery to browse, add pieces to your cart, and check out online.
        </p>
      </section>

      {/* Gallery preview */}
      <section className="py-16 px-6 bg-sand-light">
        <div className="max-w-7xl mx-auto">
          {artworks.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {artworks.map((art) => (
                <Link
                  href="/originals"
                  key={art.id}
                  className="block break-inside-avoid group"
                >
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
                  <div className="mt-3">
                    <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                    <p className="text-ocean-deep/60 text-sm">{art.medium}</p>
                    {art.price && art.status !== "sold" ? (
                      <p className="text-turquoise text-sm mt-1">
                        ${art.price.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-ocean-deep/50 text-lg">
              Collection coming soon — ask me in person!
            </p>
          )}

          <div className="text-center mt-16">
            <Link
              href="/originals"
              className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all duration-300"
            >
              Shop the Full Gallery
            </Link>
          </div>

          <p className="text-center text-ocean-deep/40 text-xs mt-12 uppercase tracking-[0.3em]">
            @deonahawaiiart
          </p>
        </div>
      </section>
    </>
  );
}
