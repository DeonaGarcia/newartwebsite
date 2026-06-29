import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Deona Garcia is a fine artist and author based in Hawaii, creating original paintings and books inspired by island life.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-28 px-6 bg-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="aspect-[3/4] bg-ocean-foam flex items-center justify-center text-driftwood-light text-sm sticky top-24">
            Artist portrait — /public/deona-hawaii.jpg
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise-deep mb-3">
              Artist &amp; Author
            </p>
            <h1 className="font-heading text-5xl font-light text-ocean-deep mb-8">
              Deona Garcia
            </h1>

            <div className="space-y-5 font-body text-driftwood leading-relaxed">
              <p>
                Deona Garcia is a fine artist and author whose work is deeply rooted
                in the landscapes, light, and culture of Hawaii. Through oil, acrylic,
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
                As an author, Deona explores themes of creativity, nature, and personal
                transformation, bringing the same observational depth found in her
                paintings to the written word.
              </p>
            </div>

            {/* Author Panels — structured for Knowledge Panel */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep mb-4">
                Find My Books
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Amazon Author Page", href: "https://amazon.com/author/deonagarcia" },
                  { label: "Goodreads", href: "https://goodreads.com/deonagarcia" },
                  { label: "Ingram Spark", href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs font-medium uppercase tracking-wider px-5 py-2.5 border border-turquoise-deep text-turquoise-deep hover:bg-turquoise-deep hover:text-pearl transition-all duration-200 cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Social proof links */}
            <div className="mt-8">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-deep mb-4">
                Connect
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Instagram", href: "https://instagram.com/deonahawaii" },
                  { label: "Facebook", href: "https://facebook.com/deonahawaii" },
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
    </>
  );
}
