import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Deona Garcia is a fine artist based in Hawaii, creating original paintings inspired by island life, volcanoes, and the ocean.",
};

const aboutPhotos = [
  {
    src: "/images/about/painting-at-easel.jpeg",
    alt: "Deona painting at her easel",
    caption: "At the easel — translating Hawaii's landscapes onto canvas",
  },
  {
    src: "/images/about/hawaii-nei-exhibition.jpeg",
    alt: "Deona at the juried Hawaii Nei art exhibition",
    caption: "Hawaii Nei Art Exhibition — my I'iwi oil painting was juried and accepted",
  },
  {
    src: "/images/about/volcano-inspiration.jpeg",
    alt: "Deona watching a volcano eruption on the Big Island",
    caption: "Volcanic inspiration — witnessing the raw power of Pele",
  },
  {
    src: "/images/about/underwater-sea-scooter.jpeg",
    alt: "Deona exploring underwater with a sea scooter",
    caption: "Exploring beneath the surface — finding inspiration underwater",
  },
  {
    src: "/images/about/ocean-snorkeling.jpeg",
    alt: "Deona snorkeling in the ocean with coastal cliffs",
    caption: "Morning ocean swims — where many of my paintings begin",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-28 px-6 bg-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="sticky top-24">
            <Image
              src="/images/about/portrait.jpeg"
              alt="Deona Garcia — fine artist based in Hawaii"
              width={420}
              height={560}
              className="w-[70%] object-cover"
              priority
            />
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Artist
            </p>
            <h1 className="font-heading text-5xl font-light text-ocean-deep mb-8">
              Deona Garcia
            </h1>

            <div className="space-y-5 font-body text-driftwood leading-relaxed">
              <p>
                Deona Garcia is a fine artist whose work is deeply rooted in the
                landscapes, light, and culture of Hawaii. Through oil, acrylic,
                and mixed media, she translates the emotional power of island life
                into paintings that resonate with collectors worldwide.
              </p>
              <p>
                Her artistic practice spans original canvases, limited edition fine
                art prints, and commissioned pieces. Each work reflects a commitment
                to authenticity — capturing not just what Hawaii looks like, but what
                it feels like.
              </p>
              <p>
                From morning ocean swims to volcanic eruptions, from underwater
                explorations to the quiet beauty of native birds — every experience
                on the islands feeds her creative practice and finds its way onto
                canvas.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep mb-4">
                Connect
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Instagram", href: "https://instagram.com/deonahawaiiart" },
                  { label: "Facebook", href: "https://facebook.com/deonahawaiiart" },
                  { label: "YouTube", href: "https://youtube.com/@deonahawaii" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-driftwood-light hover:text-turquoise-deep transition-colors duration-200 cursor-pointer underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Story Grid */}
      <section className="py-20 px-6 bg-pearl">
        <div className="max-w-6xl mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3 text-center">
            The Creative Life
          </p>
          <h2 className="font-heading text-4xl font-light text-ocean-deep mb-16 text-center">
            Where Art Begins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aboutPhotos.map((photo, i) => (
              <div
                key={photo.src}
                className={i === 0 ? "md:col-span-2" : ""}
              >
                <div className={`relative ${i === 0 ? "aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                </div>
                <p className="font-body text-sm text-driftwood-light mt-3 italic">
                  {photo.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
