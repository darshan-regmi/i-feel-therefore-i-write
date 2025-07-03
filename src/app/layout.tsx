import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://poetry.darshanregmi.com.np"),
  title: {
    default: "Poetry by Darshan Regmi | i feel, therefore i write",
    template: "%s | i feel, therefore i write",
  },
  description:
    "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough—verses that echo love, loss, healing, and self-discovery.",
  applicationName: "i feel, therefore i write",
  themeColor: "#111827", // emotionally deep and visually clean
  category: "poetry",
  generator: "Next.js 14",
  alternates: {
    canonical: "https://poetry.darshanregmi.com.np",
    languages: {
      en: "https://poetry.darshanregmi.com.np/en",
    },
  },
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.ico",
        color: "#000000",
      },
    ],
  },
  openGraph: {
    title: "Poetry by Darshan Regmi | i feel, therefore i write",
    description:
      "A soulful archive of poems by Darshan Regmi. Explore verses on love, longing, healing, and the beautiful ache of being human.",
    url: "https://poetry.darshanregmi.com.np",
    siteName: "i feel, therefore i write",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
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
    site: "@Regmi6Darshan",
    creator: "@Regmi6Darshan",
    images: ["https://poetry.darshanregmi.com.np/default-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth">
      <head>
        <title>
          i feel, therefore i write — Poetry Collection by Darshan Regmi
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough."
        />
        <link rel="canonical" href="https://poetry.darshanregmi.com.np" />
        <link rel="preload" as="image" href="/default-og-image.png" />
        <meta
          property="og:image:alt"
          content="Cover image for Darshan Regmi's poetry site"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta property="og:title" content="i feel, therefore i write" />
        <meta
          property="og:description"
          content="A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough."
        />
        <meta
          property="og:image"
          content="https://poetry.darshanregmi.com.np/default-og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://poetry.darshanregmi.com.np" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="i feel, therefore i write" />
        <meta
          name="twitter:description"
          content="A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough."
        />
        <meta
          name="twitter:image"
          content="https://poetry.darshanregmi.com.np/default-og-image.png"
        />
        <meta name="yandex-verification" content="63f833e2a4ea6374" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
