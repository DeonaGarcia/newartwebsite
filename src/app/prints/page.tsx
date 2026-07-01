"use client";

import Image from "next/image";
import Link from "next/link";
import { getPrints } from "@/lib/artworks";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

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
                <div className="mt-3 mb-2 flex items-center justify-between">
                  <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                  <AddToCartButton productId={art.id} type="print" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-ocean-deep/50 text-lg mt-12">
            Print collection coming soon.
          </p>
        )}
      </div>
    </section>
  );
}"use client";

import Image from "next/image";
import Link from "next/link";
import { getPrints } from "@/lib/artworks";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

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
                <div className="mt-3 mb-2 flex items-center justify-between">
                  <h3 className="text-ocean-deep font-light text-lg">{art.title}</h3>
                  <AddToCartButton productId={art.id} type="print" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-ocean-deep/50 text-lg mt-12">
            Print collection coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
