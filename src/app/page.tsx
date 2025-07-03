import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
  description:
    "Discover 'i feel, therefore i write' — a heartfelt poetry collection by Darshan Regmi. Dive into original poems exploring love, emotion, healing, and self-expression.",
  keywords: [
    "poetry collection",
    "Darshan Regmi poems",
    "modern poetry",
    "emotional poetry",
    "love poems",
    "personal poetry",
    "poetry about feelings",
    "Nepalese poet",
    "contemporary poetry",
  ],
  alternates: {
    canonical: "https://poetry.darshanregmi.com.np",
  },
  openGraph: {
    title: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
    description:
      "Explore heartfelt poems by Darshan Regmi. A modern collection that touches on love, emotion, healing, and self-expression.",
    url: "https://poetry.darshanregmi.com.np",
    siteName: "i feel, therefore i write",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
    description:
      "Dive into original, emotional poetry by Darshan Regmi. A modern collection about love, healing, and self-expression.",
    site: "@Regmi6Darshan",
    creator: "@Regmi6Darshan",
    images: ["https://poetry.darshanregmi.com.np/default-og-image.png"],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-serif text-center">
        i feel, therefore i write
      </h1>
      <p className="mt-6 text-lg max-w-xl text-center text-gray-600">
        for anyone who&#39;s ever felt too much, or not enough.
      </p>

      <Link
        href="/poem"
        className="mt-8 px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition"
      >
        Start Reading
      </Link>
      <p className="mt-4 text-sm text-gray-500">
        <Link href="/about-the-author" className="hover:underline">
          About the Author
        </Link>
      </p>
    </main>
  );
}
