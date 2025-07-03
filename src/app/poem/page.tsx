export const revalidate = 60;
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import PoemsWrapper from "@/components/PoemsWrapper";
import { FaHeart } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Poems by Darshan Regmi",
  description:
    "Explore Darshan Regmi’s collection of soulful poetry—emotional, reflective, and unapologetically human. Poems about love, loss, healing, and everything in between.",
  keywords: [
    "Darshan Regmi poems",
    "i feel therefore i write",
    "emotional poetry",
    "modern poetry collection",
    "poems about love",
    "soulful poems",
    "spoken word poetry",
    "Nepali poet",
    "poetry on heartbreak and healing",
  ],
  alternates: {
    canonical: "https://poetry.darshanregmi.com.np/poems",
  },
  openGraph: {
    title: "Darshan Regmi’s Poetry | i feel, therefore i write",
    description:
      "A deeply emotional and beautifully written collection of poems by Darshan Regmi. Discover verses that speak to the soul.",
    url: "https://poetry.darshanregmi.com.np/poems",
    siteName: "i feel, therefore i write",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/og-darshan-poetry.png",
        width: 1200,
        height: 630,
        alt: "Poetry by Darshan Regmi – i feel, therefore i write",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darshan Regmi’s Poems | i feel, therefore i write",
    description:
      "A personal archive of poetry by Darshan Regmi. Read poems that explore love, loneliness, memory, and meaning.",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/og-darshan-poetry.png",
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
