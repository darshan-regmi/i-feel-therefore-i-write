export const revalidate = 1;

import type { Metadata } from "next";
import Link from "next/link";
import PoemsWrapper from "@/components/PoemsWrapper";
import { FaHeart } from "react-icons/fa";

export const metadata: Metadata = {
  title: "my poems",
  description:
    "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
  keywords: [
    "poetry collection",
    "Darshan Regmi poems",
    "online poems",
    "emotional poetry",
    "modern poetry",
    "poems about love",
    "i feel therefore i write",
  ],
  alternates: {
    canonical: "https://poetry.darshanregmi.com.np/poem",
  },
  openGraph: {
    title: "All Poems | i feel, therefore i write",
    description:
      "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
    url: "https://poetry.darshanregmi.com.np/poem",
    siteName: "i feel, therefore i write",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "i feel, therefore i write",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Poems | i feel, therefore i write",
    description:
      "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
      },
    ],
  },
};

export default async function PoemsPage() {
  try {
    const res = await fetch("https://poetry.darshanregmi.com.np/api/poem", {
      next: { revalidate: 60 },
    });

    const poems = await res.json();

    return (
      <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
        <div className="flex justify-between items-center w-full mb-8">
          <Link
            href="/"
            aria-label="Go back home"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200"
          >
            ← back to home
          </Link>

          <Link
            href="/liked-poem"
            aria-label="View liked poems"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors duration-200"
          >
            <FaHeart className="w-5 h-5 text-red-400 animate-pulse" />
            liked poems
          </Link>
        </div>
        <h1 className="text-4xl font-serif text-center mb-2">my poems</h1>
        <p className="text-gray-600 text-center max-w-xl mb-8">
          bits of emotion I&#39;ve carried, now passed gently to you.
        </p>

        <PoemsWrapper poems={poems} />
      </main>
    );
  } catch (error) {
    console.error(error);
  }
}
