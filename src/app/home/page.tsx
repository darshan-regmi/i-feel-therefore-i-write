import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { getEntries } from "@/lib/poems";
import { formatLongDate, poemHref } from "@/lib/journal";
import AuthLink from "@/components/journal/AuthLink";
import IndexRow from "@/components/journal/IndexRow";
import PageShell from "@/components/journal/PageShell";

export const revalidate = 300;
export const runtime = "edge";

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
    canonical: `${SITE_URL}/home`,
  },
  openGraph: {
    title: "i feel, therefore i write | Poetry Collection by Darshan Regmi",
    description:
      "Explore heartfelt poems by Darshan Regmi. A modern collection that touches on love, emotion, healing, and self-expression.",
    url: `${SITE_URL}/home`,
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
    images: [`${SITE_URL}/default-og-image.png`],
  },
};

function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/home#profilepage`,
        url: `${SITE_URL}/home`,
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
        "@id": `${SITE_URL}/home#collection`,
        url: `${SITE_URL}/entries`,
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

export default async function HomePage() {
  const entries = await getEntries();
  const latest = entries.slice(0, 10);

  return (
    <>
      <JsonLd />
      <PageShell header={false}>
        <header className="home-top">
          <h1 className="page-title">i feel, therefore i write</h1>
          <p className="page-intro">
            for anyone who’s ever felt too much, or not enough.
          </p>
        </header>

        <div>
          {latest.map((entry) => (
            <IndexRow
              key={entry.poem.id}
              home
              meta={formatLongDate(entry.publishedAt)}
              title={entry.poem.title}
              href={poemHref(entry.poem)}
            />
          ))}
          <IndexRow
            home
            meta={<span aria-hidden="true" />}
            title="all entries →"
            href="/entries"
          />
        </div>

        <footer className="home-footer">
          <Link href="/about">about</Link>
          <AuthLink />
        </footer>
      </PageShell>
    </>
  );
}
