import type { Metadata } from "next";
import Link from "next/link";
import { OG_IMAGE, OG_IMAGE_SIZE, SITE_URL } from "@/lib/site";
import { getEntries } from "@/lib/poems";
import { entryShortMeta, groupByMonth, poemHref } from "@/lib/journal";
import IndexRow from "@/components/journal/IndexRow";
import PageShell from "@/components/journal/PageShell";

export const revalidate = 300;
export const runtime = "edge";

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
    canonical: `${SITE_URL}/entries`,
  },
  openGraph: {
    title: "Darshan Regmi's Poetry | i feel, therefore i write",
    description:
      "A deeply emotional and beautifully written collection of poems by Darshan Regmi. Discover verses that speak to the soul.",
    url: `${SITE_URL}/entries`,
    siteName: "i feel, therefore i write",
    images: [
      {
        url: OG_IMAGE,
        ...OG_IMAGE_SIZE,
        alt: "poetry by Darshan Regmi — i feel, therefore i write",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darshan Regmi's Poems | i feel, therefore i write",
    description:
      "A personal archive of poetry by Darshan Regmi. Read poems that explore love, loneliness, memory, and meaning.",
    images: [OG_IMAGE],
  },
};

export default async function EntriesPage() {
  const entries = await getEntries();
  const groups = groupByMonth(entries);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/entries#collection`,
    url: `${SITE_URL}/entries`,
    name: "Poems by Darshan Regmi",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    hasPart: entries.slice(0, 25).map(({ poem }) => ({
      "@type": "CreativeWork",
      "@id": `${SITE_URL}${poemHref(poem)}`,
      name: poem.title,
      url: `${SITE_URL}${poemHref(poem)}`,
      datePublished: poem.createdAt,
      author: { "@id": `${SITE_URL}/#person` },
      genre: "Poetry",
    })),
  };

  return (
    <PageShell parent="/home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-header flex justify-between items-center wrap-anywhere">
        <h1 className="page-title">all entries</h1>
        <p className="page-title">
          <Link href="/liked">liked entries</Link>
        </p>
      </div>
      <p className="meta entries-meta">
        {entries.length} entries · newest first
      </p>
      <div className="entries-list">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="month-heading">{group.label}</h2>
            {group.entries.map((entry) => (
              <IndexRow
                key={entry.poem.id}
                meta={entryShortMeta(entry)}
                title={entry.poem.title}
                href={poemHref(entry.poem)}
              />
            ))}
          </section>
        ))}
      </div>
      <footer className="page-footer">
        <Link href="/about">about</Link>
      </footer>
    </PageShell>
  );
}
