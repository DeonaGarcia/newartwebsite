"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-sand-light/90 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="/logo.png"
              alt="Deona Hawaii"
              width={48}
              height={48}
              className="h-12 w-auto"
              priority
            />
            <span className="font-heading text-2xl font-semibold tracking-wide text-ocean-deep">
              Deona Hawaii
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-body text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer ${
                    pathname === link.href
                      ? "text-ocean-deep border-b-2 border-ocean pb-1"
                      : "text-driftwood-light hover:text-ocean-deep"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6 text-ocean-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <ul className="md:hidden pb-6 space-y-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block font-body text-sm font-medium uppercase tracking-widest py-2 cursor-pointer ${
                    pathname === link.href ? "text-ocean-deep" : "text-driftwood-light hover:text-ocean-deep"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
