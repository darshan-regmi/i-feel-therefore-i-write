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

export const viewport = {
  themeColor: "#111827",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://poetry.darshanregmi.com.np"),
  title: {
    default: "Poetry by Darshan Regmi | i feel, therefore i write",
    template: "%s | i feel, therefore i write",
  },
  description:
    "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough—verses that echo love, loss, healing, and self-discovery.",
  applicationName: "i feel, therefore i write",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
