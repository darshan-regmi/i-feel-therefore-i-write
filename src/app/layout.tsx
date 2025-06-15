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
    default: "i feel, therefore i write - Poetry Collection",
    template: "%s | i feel, therefore i write",
  },
  description:
    "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
  applicationName: "i feel, therefore i write",
  themeColor: "#ffffff",
  category: "poetry",
  generator: "Next.js 14",
  alternates: {
    canonical: "https://poetry.darshanregmi.com.np",
    languages: {
      en: "https://poetry.darshanregmi.com.np/en",
    },
  },
  keywords: [
    // Core poetry + writing
    "poetry",
    "poems",
    "creative writing",
    "short poems",
    "modern poetry",
    "free verse poetry",
    "contemporary poetry",
    "english poem",

    // Emotional tone
    "emotions",
    "feelings",
    "love poems",
    "sad poems",
    "emotional poems",
    "romantic poetry",
    "self-expression",

    // Personal brand
    "Darshan Regmi",
    "poet Darshan Regmi",
    "i feel therefore i write",
    "wordsbydarshan",
    "_darshan_regmi",
    "Nepalese poet",

    // Search-friendly discovery
    "poetry collection",
    "online poetry book",
    "daily poems",
    "relatable poetry",
    "aesthetic writing",
    "poetry website",

    // Bonus discovery hooks
    "healing through poetry",
    "personal poems",
    "poetry for overthinkers",
    "writing from the heart",
    "vulnerable poetry",
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
    title: "i feel, therefore i write",
    description:
      "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
    url: "https://poetry.darshanregmi.com.np",
    siteName: "i feel, therefore i write",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "i feel, therefore i write",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "i feel, therefore i write",
    description:
      "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}