import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { getPoem, getPoemNavigation } from "@/lib/poems";
import {
  entryLongMeta,
  isCanonicalPoemSlug,
  poemHref,
} from "@/lib/journal";
import LikeButton from "@/components/journal/LikeButton";
import PageShell from "@/components/journal/PageShell";
import PoemBody from "@/components/journal/PoemBody";

export const revalidate = 300;
export const runtime = "edge";

type PoemRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PoemRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const poem = await getPoem(slug);

  if (!poem) {
    return {
      title: "Poem Not Found",
      description: "The poem you are looking for could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const excerpt =
    poem.content.substring(0, 155).replace(/\n/g, " ").trim() +
    (poem.content.length > 155 ? "…" : "");
  const pageDescription =
    poem.description ?? `${excerpt} — a poem by Darshan Regmi.`;
  const pageUrl = `${SITE_URL}${poemHref(poem)}`;
  const ogImage = `${pageUrl}/opengraph-image`;

  return {
    title: poem.title,
    description: pageDescription,
    alternates: { canonical: pageUrl },
    keywords: [
      poem.title,
      "poetry",
      "poem",
      "Darshan Regmi",
      "i feel therefore i write",
    ],
    openGraph: {
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
      url: pageUrl,
      siteName: "i feel, therefore i write",
      type: "article",
      publishedTime: poem.createdAt,
      modifiedTime: poem.updatedAt,
      authors: ["Darshan Regmi"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${poem.title} — a poem by Darshan Regmi`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
      images: [ogImage],
    },
  };
}

export default async function PoemPage({ params }: PoemRouteProps) {
  const { slug } = await params;
  const poem = await getPoem(slug);

  if (!poem) {
    notFound();
  }

  // Title changes keep working: the URL is resolved by the stable Notion id,
  // then this redirects an old cosmetic title to the current canonical slug.
  if (!isCanonicalPoemSlug(slug, poem)) {
    permanentRedirect(poemHref(poem));
  }

  const { entry, previous, next } = await getPoemNavigation(poem);
  const pageUrl = `${SITE_URL}${poemHref(poem)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CreativeWork", "Article"],
        "@id": `${pageUrl}#poem`,
        headline: poem.title,
        name: poem.title,
        articleBody: poem.content,
        genre: "Poetry",
        inLanguage: "en",
        datePublished: poem.createdAt,
        dateModified: poem.updatedAt,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        author: { "@id": `${SITE_URL}/#person` },
        publisher: { "@id": `${SITE_URL}/#person` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/home` },
          { "@type": "ListItem", position: 2, name: "Entries", item: `${SITE_URL}/entries` },
          { "@type": "ListItem", position: 3, name: poem.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <PageShell parent="/entries">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {entry ? <p className="meta poem-meta">no. {entryLongMeta(entry)}</p> : null}
        <h1 className="poem-title">{poem.title}</h1>
        <PoemBody content={poem.content} />

        <div className="poem-actions">
          <LikeButton poemId={poem.id} />
        </div>

        <nav className="poem-nav" aria-label="poem navigation">
          {previous ? (
            <Link href={poemHref(previous.poem)} className="poem-nav-previous">
              previous
            </Link>
          ) : (
            <span className="poem-nav-previous" aria-hidden="true" />
          )}
          <Link href="/entries" className="poem-nav-all">
            all entries
          </Link>
          {next ? (
            <Link href={poemHref(next.poem)} className="poem-nav-next">
              next
            </Link>
          ) : (
            <span className="poem-nav-next" aria-hidden="true" />
          )}
        </nav>
      </article>
    </PageShell>
  );
}
