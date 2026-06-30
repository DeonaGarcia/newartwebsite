import Link from "next/link";
import Image from "next/image";
import { getFeaturedArtworks, getPublicArtworks } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedArtworks();
  const allOriginals = await getPublicArtworks("original");
  const displayArtworks = featured.length > 0 ? featured : allOriginals.slice(0, 6);

  return (
    <>
      {/* Banner */}
      <section className="w-full bg-pearl">
        <div className="relative w-full" style={{ aspectRatio: "2000/300" }}>
          <Image
            src="/banner.png"
            alt="Deona Hawaii Art - Original Art Inspired by the Islands"
            fill
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* Hero - full-bleed with featured artwork */}
      <section className="relative flex items-center justify-center min-h-[70vh] bg-ocean-deep px-6">
        {displayArtworks[0] && (
          <Image
            src={displayArtworks[0].imageUrl}
            alt={displayArtworks[0].title}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-light text-pearl tracking-wide mb-4">
            Deona Hawaii
          </h1>
          <p className="text-xl md:text-2xl text-pearl/80 font-light mb-8">
            Original Art Inspired by the Islands
          </p>
          <Link
            href="/originals"
            className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all duration-300"
          >
            View Collection
          </Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 px-6 bg-sand-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Gallery
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-ocean-deep">
              Featured Collection
            </h2>
          </div>
          {displayArtworks.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {displayArtworks.map((art) => (
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
                  </div>
                  <div className="mt-3">
                    <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                    <p className="text-ocean/60 text-sm">{art.medium}</p>
                    {art.price && art.status !== "sold" ? (
                      <p className="text-turquoise text-sm mt-1">
                        ${art.price.toLocaleString()}
                      </p>
                    ) : art.status === "sold" ? (
                      <p className="text-coral text-sm mt-1 uppercase tracking-wider">Sold</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-ocean-deep/50">
              Collection coming soon.
            </p>
          )}
          <div className="text-center mt-12">
            <Link
              href="/originals"
              className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all duration-300"
            >
              View All Originals
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-6 bg-pearl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-light text-ocean-deep mb-6">
            About the Artist
          </h2>
          <p className="font-body text-ocean leading-relaxed mb-8">
            Inspired by the vibrant colors and serene landscapes of Hawaii,
            each piece captures the essence of island life through bold
            brushstrokes and vivid palettes.
          </p>
          <Link
            href="/about"
            className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </section>
    </>
  );
}

