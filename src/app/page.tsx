import Link from "next/link";
import Image from "next/image";
import { getFeaturedArtworks } from "@/lib/artworks";

export default function Home() {
  const featured = getFeaturedArtworks();

  return (
    <>
      {/* Hero — full-bleed, gallery-first */}
      <section className="relative flex items-center justify-center min-h-[90vh] bg-ocean-deep px-6">
        {/* Background: first featured artwork */}
        {featured[0] && (
          <Image
            src={`/art/${featured[0].file}`}
            alt={featured[0].title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep/60 via-ocean-deep/30 to-ocean-deep/80" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise mb-6">
            Original Fine Art
          </p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-pearl mb-8 leading-[1.1]">
            Deona Hawaii
          </h1>
          <p className="font-body text-lg text-ocean-foam max-w-md mx-auto mb-12 leading-relaxed">
            Paintings inspired by the sea, light, and spirit of Hawaii.
          </p>
          <Link
            href="/gallery"
            className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] px-12 py-4 border border-turquoise text-turquoise hover:bg-turquoise hover:text-ocean-deep transition-all duration-200 cursor-pointer"
          >
            Enter the Gallery
          </Link>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-28 px-6 bg-sand-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Selected Works
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-ocean-deep">
              Featured Collection
            </h2>
          </div>

          {/* Large feature image */}
          {featured[0] && (
            <div className="mb-16">
              <div className="aspect-[16/9] relative overflow-hidden bg-ocean-foam">
                <Image
                  src={`/art/${featured[0].file}`}
                  alt={featured[0].title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="font-heading text-2xl text-ocean-deep">{featured[0].title}</p>
              </div>
            </div>
          )}

          {/* Grid of remaining featured */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.slice(1, 4).map((art) => (
              <div key={art.id} className="group cursor-pointer">
                <div className="aspect-[4/5] relative overflow-hidden bg-ocean-foam">
                  <Image
                    src={`/art/${art.file}`}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3">
                  <p className="font-heading text-lg text-ocean-deep">{art.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/gallery"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep border-b-2 border-turquoise-deep pb-1 hover:text-ocean-deep hover:border-ocean-deep transition-colors duration-200 cursor-pointer"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-28 px-6 bg-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="aspect-[3/4] bg-ocean-foam flex items-center justify-center text-driftwood-light text-sm">
            Artist portrait — /public/deona-hawaii.jpg
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              The Artist
            </p>
            <h2 className="font-heading text-4xl font-light text-ocean-deep mb-6">
              About Deona
            </h2>
            <p className="font-body text-driftwood leading-relaxed mb-4">
              Deona Garcia is a fine artist and author based in Hawaii. Her
              paintings capture the vivid colors, textures, and emotional
              depth of island life.
            </p>
            <p className="font-body text-driftwood leading-relaxed mb-8">
              As an author, she explores themes of creativity, nature, and
              personal transformation.
            </p>
            <Link
              href="/about"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep border-b-2 border-turquoise-deep pb-1 hover:text-ocean-deep hover:border-ocean-deep transition-colors duration-200 cursor-pointer"
            >
              Read Full Bio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
