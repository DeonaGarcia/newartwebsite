import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOriginals } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Deona Hawaii Art | Original Fine Art",
  description:
    "Original fine art inspired by the beauty of Hawaii. Paintings and prints by Deona Garcia.",
};

export default function HomePage() {
  const gallery = getOriginals();

  return (
    <>
      {/* Banner — full image, no crop */}
      <section className="w-full bg-pearl">
        <div className="relative w-full">
          <Image
            src="/banner.png"
            alt="Deona Hawaii Art - Original Art Inspired by the Islands"
            width={2000}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Hero — full Kealakekua Bay painting, uncropped */}
      <section className="relative flex items-center justify-center h-[60vh] px-6 overflow-hidden bg-ocean-deep">
        <Image
          src="/art/kealakekua-bay.jpg"
          alt="Kealakekua Bay — original painting by Deona Garcia"
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ocean-deep/30" />
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-light text-pearl tracking-wide mb-4 drop-shadow-lg">
            Deona Hawaii
          </h1>
          <p className="text-xl md:text-2xl text-pearl/90 font-light mb-8 drop-shadow-lg">
            Original Art Inspired by the Islands
          </p>
          <Link
            href="/originals"
            className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all duration-300 bg-ocean-deep/40"
          >
            View Collection
          </Link>
        </div>
      </section>

      {/* Gallery — all originals */}
      <section className="py-20 px-6 bg-sand-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Original Works
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-ocean-deep">
              Gallery
            </h2>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.map((artwork) => (
                <Link
                  key={artwork.id}
                  href="/originals"
                  className="group block"
                >
                  <div className="relative overflow-hidden bg-pearl">
                    <Image
                      src={`/art/${artwork.file}`}
                      alt={artwork.title}
                      width={artwork.width}
                      height={artwork.height}
                      className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <p className="font-heading text-lg text-ocean-deep mt-4 group-hover:text-turquoise-deep transition-colors duration-200">
                    {artwork.title}
                  </p>
                </Link>
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

      {/* About Teaser */}
      <section className="py-20 px-6 bg-pearl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-light text-ocean-deep mb-6">
            About the Artist
          </h2>
          <p className="font-body text-ocean leading-relaxed mb-8">
            Inspired by the vibrant colors and serene landscapes of Hawaii, each
            piece captures the essence of island life through bold brushstrokes
            and vivid palettes.
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
