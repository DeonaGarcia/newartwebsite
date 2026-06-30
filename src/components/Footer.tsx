import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/deonahawaii" },
  { label: "Facebook", href: "https://facebook.com/deonahawaii" },
  { label: "YouTube", href: "https://youtube.com/@deonahawaii" },
];

export function Footer() {
  return (
    <footer className="bg-ocean-deep text-ocean-foam">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Deona Hawaii Art"
                width={40}
                height={40}
                className="h-10 w-auto brightness-110"
              />
              <p className="font-heading text-2xl font-semibold text-pearl">
                Deona Hawaii Art
              </p>
            </div>
            <p className="text-sm text-ocean-mist leading-relaxed">
              Original fine art inspired by the beauty of Hawaii.
              Paintings and prints.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-light mb-4">
              Explore
            </p>
            <ul className="space-y-2">
              {[
                { href: "/originals", label: "Originals" },
                { href: "/prints", label: "Prints" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ocean-foam hover:text-pearl transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-light mb-4">
              Connect
            </p>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ocean-foam hover:text-pearl transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ocean/30 text-center">
          <p className="text-xs text-ocean-mist">
            &copy; {new Date().getFullYear()} Deona Hawaii Art. All rights reserved.
            All artwork is protected by copyright.
          </p>
        </div>
      </div>
    </footer>
  );
}

