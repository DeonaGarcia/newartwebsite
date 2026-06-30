import type { Metadata } from "next";
import Link from "next/link";
import { getPublicArtworks } from "@/lib/blob-store";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Art Prints",
    description:
          "Shop fine art prints by Deona Hawaii Art. High-quality reproductions of original paintings.",
};

export default async function PrintsPage() {
    const prints = await getPublicArtworks("print");

  return (
        <section className="py-20 px-6 bg-sand-light">
              <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-16">
                                <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
                                            Fine Art Reproductions
                                </p>p>
                                <h1 className="font-heading text-5xl md:text-6xl font-light text-ocean-deep">
                                            Art Prints
                                </h1>h1>
                                <p className="font-body text-ocean mt-4 max-w-lg mx-auto">
                                            High-quality prints of original paintings, available in multiple sizes.
                                </p>p>
                      </div>div>
              
                {prints.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {prints.map((art) => (
                                    <div key={art.id} className="group">
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
                                                    </div>div>
                                                    <div className="mt-3">
                                                                      <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>h3>
                                                      {art.price ? (
                                                          <p className="text-turquoise text-sm mt-1">
                                                                                From ${art.price.toLocaleString()}
                                                          </p>p>
                                                        ) : null}
                                                    </div>div>
                                    </div>div>
                                  ))}
                    </div>div>
                  ) : (
                    <div className="text-center py-16">
                                <p className="text-ocean-deep/50 text-lg mb-4">
                                              Prints coming soon.
                                </p>p>
                                <Link
                                                href="/originals"
                                                className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all duration-300"
                                              >
                                              Browse Originals
                                </Link>Link>
                    </div>div>
                      )}
              </div>div>
        </section>section>
      );
}
</section>
