export const revalidate = 60;
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import PoemsClient from "@/components/PoemClient";
import { getPoemsFromNotion } from "@/lib/notion";
import { FaHeart } from "react-icons/fa";

const SITE_URL = "https://poetry.darshanregmi.com.np";

export const metadata: Metadata = {
  title: "Poems by Darshan Regmi",
  description:
    "Explore Darshan Regmi's collection of soulful poetry—emotional, reflective, and unapologetically human. Poems about love, loss, healing, and everything in between.",
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
    canonical: `${SITE_URL}/poem`,
  },
  openGraph: {
    title: "Darshan Regmi's Poetry | i feel, therefore i write",
    description:
      "A deeply emotional and beautifully written collection of poems by Darshan Regmi. Discover verses that speak to the soul.",
    url: `${SITE_URL}/poem`,
    siteName: "i feel, therefore i write",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-darshan-poetry.png`,
        width: 1200,
        height: 630,
        alt: "Poetry by Darshan Regmi – i feel, therefore i write",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darshan Regmi's Poems | i feel, therefore i write",
    description:
      "A personal archive of poetry by Darshan Regmi. Read poems that explore love, loneliness, memory, and meaning.",
    site: "@Regmi6Darshan",
    creator: "@Regmi6Darshan",
    images: [`${SITE_URL}/og-darshan-poetry.png`],
  },
};

export default async function PoemsPage() {
  let poems: Awaited<ReturnType<typeof getPoemsFromNotion>> = [];
  let fetchError = false;

  try {
    poems = await getPoemsFromNotion();
  } catch (error) {
    console.error("Failed to load poems for /poem:", error);
    fetchError = true;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/poem#collection`,
    url: `${SITE_URL}/poem`,
    name: "Poems by Darshan Regmi",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    hasPart: poems.slice(0, 25).map((p) => ({
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/poem/${p.id}`,
      name: p.title,
      url: `${SITE_URL}/poem/${p.id}`,
      datePublished: p.createdAt,
      author: { "@id": `${SITE_URL}/#person` },
      genre: "Poetry",
    })),
  };

  if (fetchError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium">
            Unable to load poems
          </p>
          <p className="text-gray-600 text-sm">
            Sorry, we couldn&#39;t load the poems right now. Please try again
            later.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors duration-300"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center p-6 sm:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl">
        <nav className="flex justify-between items-center w-full mb-12">
          <Link
            href="/"
            aria-label="Go back home"
            className="group flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span className="font-medium">back to home</span>
          </Link>

          <Link
            href="/liked-poem"
            aria-label="View liked poems"
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <FaHeart className="w-4 h-4 text-red-400 group-hover:text-red-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">liked poems</span>
          </Link>
        </nav>

        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-serif text-gray-900 tracking-tight">
            Poems by Darshan Regmi
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light italic max-w-2xl mx-auto">
            bits of emotion I&#39;ve carried, now passed gently to you.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </header>

        {/* SSR fallback: real anchors for every poem so crawlers can follow them
            even if JS is disabled or the client island fails to hydrate. */}
        <noscript>
          <ul className="w-full max-w-3xl space-y-6 px-4 mx-auto">
            {poems.map((poem) => (
              <li key={poem.id}>
                <article className="p-6 bg-white rounded-2xl border border-gray-200">
                  <h2 className="text-2xl font-serif mb-4 text-gray-900">
                    <a href={`/poem/${poem.id}`}>{poem.title}</a>
                  </h2>
                  <p className="whitespace-pre-line text-sm text-gray-700">
                    {poem.content.split("\n").slice(0, 4).join("\n")}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </noscript>

        <div className="mt-8">
          <PoemsClient poems={poems} />
        </div>
      </div>
    </main>
  );
}
