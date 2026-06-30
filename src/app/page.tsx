import Link from "next/link";
import Image from "next/image";
import { getFeaturedArtworks } from "@/lib/artworks";

export default function Home() {
  const featured = getFeaturedArtworks();

  return (
    <>
      {/* Banner */}
      <section className="w-full bg-pearl">
        <div className="relative w-full" style={{ aspectRatio: "2000/300" }}>
          <Image
            src="/banner.png"
            alt="Deona Hawaii Art — Original Art Inspired by the Islands"
            fill
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* Hero — full-bleed with featured artwork */}
      <section className="relative flex items-center justify-center min-h-[70vh] bg-ocean-deep px-6">
        {featured[0] && (
          <Image
            src={`/art/${featured[0].file}`}
            alt={featured[0].title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep/50 via-ocean-deep/20 to-ocean-deep/70" />
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/originals"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] px-12 py-4 bg-turquoise text-ocean-deep hover:bg-turquoise-deep transition-all duration-200 cursor-pointer"
            >
              View Originals
            </Link>
            <Link
              href="/prints"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] px-12 py-4 border border-turquoise text-turquoise hover:bg-turquoise hover:text-ocean-deep transition-all duration-200 cursor-pointer"
            >
              Shop Prints
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-24 px-6 bg-ocean-foam/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Selected Works
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-ocean-deep">
              Featured Collection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((art) => (
              <Link key={art.id} href="/originals" className="group cursor-pointer">
                <div
                  className="relative overflow-hidden bg-ocean-foam rounded-sm shadow-sm"
                  style={{ aspectRatio: `${art.width}/${art.height}` }}
                >
                  <Image
                    src={`/art/${art.file}`}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="mt-3">
                  <p className="font-heading text-xl text-ocean-deep group-hover:text-turquoise-deep transition-colors duration-200">
                    {art.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/originals"
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep border-b-2 border-turquoise-deep pb-1 hover:text-ocean-deep hover:border-ocean-deep transition-colors duration-200 cursor-pointer"
            >
              View All Originals
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 px-6 bg-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="aspect-[3/4] bg-ocean-foam/50 flex items-center justify-center text-ocean-light text-sm rounded-sm">
            Artist portrait
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              The Artist
            </p>
            <h2 className="font-heading text-4xl font-light text-ocean-deep mb-6">
              About Deona
            </h2>
            <p className="font-body text-ocean leading-relaxed mb-4">
              Deona Garcia is a fine artist and author based in Hawaii. Her
              paintings capture the vivid colors, textures, and emotional
              depth of island life.
            </p>
            <p className="font-body text-ocean leading-relaxed mb-8">
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
