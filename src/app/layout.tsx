import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#111827",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Poetry by Darshan Regmi | i feel, therefore i write",
    template: "%s | i feel, therefore i write",
  },
  description:
    "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough—verses that echo love, loss, healing, and self-discovery.",
  applicationName: "i feel, therefore i write",
  category: "poetry",
  // No `alternates.canonical` here on purpose: root-layout metadata is
  // inherited by every route, so declaring the homepage canonical up here made
  // /poem/doorway, /login, /liked-poem and /poems all claim to be duplicates of
  // "/". Each route declares its own instead.
  keywords: [
    // Core poetry topics
    "poetry",
    "poems",
    "creative writing",
    "modern poetry",
    "free verse",
    "english poems",
    "short poems",
    "contemporary poetry",

    // Emotional angles
    "emotional poems",
    "love poems",
    "sad poetry",
    "healing through poetry",
    "vulnerable writing",
    "poetry for overthinkers",
    "relatable poetry",

    // Personal branding
    "Darshan Regmi",
    "i feel therefore i write",
    "wordsbydarshan",
    "_darshan_regmi",
    "Nepalese poet",
    "young poets",
    "emerging writers",

    // Discovery + aesthetic
    "online poetry collection",
    "aesthetic poems",
    "poetry website",
    "poetry blog",
    "daily poems",
    "poetry for the soul",
  ],
  authors: [{ name: "Darshan Regmi", url: "https://darshanregmi.com.np" }],
  creator: "Darshan Regmi",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Poetry by Darshan Regmi | i feel, therefore i write",
    description:
      "A soulful archive of poems by Darshan Regmi. Explore verses on love, longing, healing, and the beautiful ache of being human.",
    url: SITE_URL,
    siteName: "i feel, therefore i write",
    images: [
      {
        url: `${SITE_URL}/default-og-image.png`,
        width: 1200,
        height: 630,
        alt: "Poetry by Darshan Regmi – i feel, therefore i write",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poetry by Darshan Regmi | i feel, therefore i write",
    description:
      "A personal poetry collection exploring emotion, reflection, and vulnerability. Written by Darshan Regmi.",
    images: [`${SITE_URL}/default-og-image.png`],
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "i feel, therefore i write",
      description:
        "A personal collection of poems by Darshan Regmi exploring love, loss, healing, and self-discovery.",
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/poem?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Darshan Regmi",
      url: "https://darshanregmi.com.np",
      image: `${SITE_URL}/author.jpg`,
      jobTitle: "Poet",
      sameAs: [
        "https://instagram.com/bydarshanregmi",
        "https://instagram.com/_darshan_regmi",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
