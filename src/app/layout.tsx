import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deonahawaiiart.com"),
  title: {
    default: "Deona Hawaii Art | Fine Art & Author",
    template: "%s | Deona Hawaii Art",
  },
  description:
    "Original fine art inspired by the beauty of Hawaii. Paintings, prints, and books by Deona Garcia.",
  keywords: [
    "Deona Hawaii Art",
    "Deona Garcia",
    "Hawaii art",
    "fine art",
    "original paintings",
    "Hawaii artist",
    "art prints",
    "author",
  ],
  authors: [{ name: "Deona Garcia", url: "https://deonahawaiiart.com" }],
  creator: "Deona Garcia",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://deonahawaiiart.com",
    siteName: "Deona Hawaii Art",
    title: "Deona Hawaii Art | Fine Art & Author",
    description:
      "Original fine art inspired by the beauty of Hawaii. Paintings, prints, and books by Deona Garcia.",
    images: [
      {
        url: "/art/kealakekua-bay.jpg",
        width: 2000,
        height: 1466,
        alt: "Kealakekua Bay - original painting by Deona Hawaii",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@deonahawaii",
    title: "Deona Hawaii Art | Fine Art & Author",
    description: "Original fine art inspired by the beauty of Hawaii.",
    images: ["/art/kealakekua-bay.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Deona Garcia",
              alternateName: "Deona Hawaii",
              url: "https://deonahawaiiart.com",
              jobTitle: "Artist & Author",
              description:
                "Fine artist and author based in Hawaii, creating original paintings and books inspired by island life.",
              sameAs: [
                "https://instagram.com/deonahawaiiart",
                "https://facebook.com/deonahawaiiart",
                "https://youtube.com/@deonahawaii",
                "https://amazon.com/author/deonagarcia",
                "https://goodreads.com/deonagarcia",
              ],
              image: "https://deonahawaiiart.com/logo.png",
              knowsAbout: [
                "Fine Art",
                "Painting",
                "Hawaii Art",
                "Book Writing",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Navigation />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
