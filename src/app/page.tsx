import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

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
    canonical: SITE_URL,
  },
  openGraph: {
    title: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
    description:
      "Explore heartfelt poems by Darshan Regmi. A modern collection that touches on love, emotion, healing, and self-expression.",
    url: SITE_URL,
    siteName: "i feel, therefore i write",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/default-og-image.png`,
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
    images: [`${SITE_URL}/default-og-image.png`],
  },
};

/**
 * The root layout already emits WebSite + Person. This adds the page-level
 * types that tell Google the homepage is a personal profile whose whole point
 * is the author and their poems.
 */
function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: `${SITE_URL}/`,
        name: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
        description:
          "A heartfelt poetry collection by Darshan Regmi, exploring love, emotion, healing, and self-expression.",
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${SITE_URL}/#person` },
        about: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#collection`,
        url: `${SITE_URL}/poem`,
        name: "Poems by Darshan Regmi",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#person` },
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListUnordered",
          numberOfItems: 0,
          itemListElement: [],
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-100/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Decorative line above title */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tight leading-tight">
          i feel, therefore i write
        </h1>

        <p className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto text-gray-600 font-light italic">
          for anyone who&#39;s ever felt too much, or not enough.
        </p>

        {/* CTA Button */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <Link
            href="/poem"
            className="group relative px-8 py-3.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="relative z-10">Start Reading</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            href="/about-the-author"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300 relative group"
          >
            <span>About the Author</span>
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        {/* Decorative line below */}
        <div className="flex items-center justify-center gap-4 mt-16 pt-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>
      </div>

      {/* Floating quote in background */}
      <div className="absolute bottom-8 right-8 max-w-xs text-right opacity-10 pointer-events-none hidden lg:block">
        <p className="text-6xl font-serif text-gray-400">&ldquo;</p>
      </div>
    </main>
    </>
  );
}
