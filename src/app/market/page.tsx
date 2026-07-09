import Link from "next/link";
import Image from "next/image";

export default function MarketPage() {
  return (
    <section className="min-h-screen bg-ocean-deep flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative w-40 h-40 mb-8 rounded-full overflow-hidden border-2 border-turquoise">
        <Image
          src="/art/kealakekua-bay.jpg"
          alt="Deona Hawaii Art"
          fill
          className="object-cover"
          priority
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-light text-pearl tracking-wide mb-3">
        Aloha!
      </h1>
      <p className="text-lg text-pearl/80 font-light mb-10 max-w-md">
        Thanks for stopping by the booth. Tap below to pay with Venmo,
        or browse the full collection online.
      </p>

      <a
        href="https://venmo.com/u/Deoona-Garcia"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-xs bg-turquoise text-ocean-deep text-lg font-semibold uppercase tracking-widest py-4 px-8 mb-4 hover:bg-turquoise-deep transition-all duration-300"
      >
        Pay with Venmo
      </a>
      <p className="text-pearl/50 text-sm mb-10">@Deoona-Garcia</p>

      <Link
        href="/originals"
        className="inline-block border border-pearl/40 text-pearl px-8 py-3 text-sm tracking-widest uppercase hover:bg-pearl hover:text-ocean-deep transition-all duration-300"
      >
        View Full Collection
      </Link>

      <p className="text-pearl/40 text-xs mt-16 uppercase tracking-[0.3em]">
        @deonahawaiiart
      </p>
    </section>
  );
}

