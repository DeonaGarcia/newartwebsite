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
                      </div>div>
              </section>section>
        
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
                                </h1>h1>
                                <p className="text-xl md:text-2xl text-pearl/80 font-light mb-8">
                                            Original Art Inspired by the Islands
                                </p>p>
                                <Link
                                              href="/originals"
                                              className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all duration-300"
                                            >
                                            View Collection
                                </Link>Link>
                      </div>div>
              </section>section>
        
          {/* Featured Collection */}
              <section className="bg-pearl py-20 px-6">
                      <div className="max-w-7xl mx-auto">
                                <h2 className="text-3xl font-light text-ocean-deep text-center mb-4">
                                            Featured Collection
                                </h2>h2>
                                <p className="text-ocean-deep/60 text-center mb-12 max-w-2xl mx-auto">
                                            Each piece captures the spirit, color, and energy of Hawaii
                                </p>p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {displayArtworks.slice(0, 6).map((art) => (
                        <Link key={art.id} href="/originals" className="group">
                                        <div className="relative overflow-hidden bg-sand/30" style={{ aspectRatio: `${art.width}/${art.height}` }}>
                                                          <Image
                                                                                src={art.imageUrl}
                                                                                alt={art.title}
                                                                                fill
                                                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                              />
                                          {art.status === "sold" && (
                                              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                                                    SOLD
                                              </div>div>
                                                          )}
                                        </div>div>
                                        <div className="mt-3">
                                                          <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>h3>
                                          {art.price ? (
                                              <p className="text-turquoise text-sm mt-1">${art.price.toLocaleString()}</p>p>
                                            ) : null}
                                        </div>div>
                        </Link>Link>
                      ))}
                                </div>div>
                                <div className="text-center mt-12">
                                            <Link
                                                            href="/originals"
                                                            className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all duration-300"
                                                          >
                                                          View All Originals
                                            </Link>Link>
                                </div>div>
                      </div>div>
              </section>section>
        
          {/* About Preview */}
              <section className="bg-sand/30 py-20 px-6">
                      <div className="max-w-4xl mx-auto text-center">
                                <h2 className="text-3xl font-light text-ocean-deep mb-6">About the Artist</h2>h2>
                                <p className="text-ocean-deep/70 text-lg leading-relaxed mb-8">
                                            Based in Hawaii, Deona creates original artwork inspired by the beauty,
                                            culture, and spirit of the islands. Each piece is a reflection of life
                                            surrounded by the Pacific.
                                </p>p>
                                <Link
                                              href="/about"
                                              className="text-turquoise hover:text-ocean-deep transition-colors duration-300 text-sm tracking-widest uppercase"
                                            >
                                            Learn More
                                </Link>Link>
                      </div>div>
              </section>section>
        </>>
      );
}
</>
