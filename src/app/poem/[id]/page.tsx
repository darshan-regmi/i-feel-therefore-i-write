export const revalidate = 60;
export const runtime = 'edge';

import { Metadata } from "next";
import Link from "next/link";
import { getPoemById, getPoemsFromNotion, type Poem } from "@/lib/notion";
import { notFound } from "next/navigation";
import BackButtonWithScroll from "@/components/BackButton";
import LikeButton from "@/components/LikeButtonLazy";

const SITE_URL = "https://poetry.darshanregmi.com.np";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const poem = await getPoemById(params.id);

  if (!poem) {
    return {
      title: "Poem Not Found",
      description: "The poem you are looking for could not be found.",
      robots: { index: false, follow: true },
    };
  }

  // Prefer a hand-written Notion `Description` when present; otherwise fall
  // back to a content excerpt so meta descriptions stay relevant for sharing.
  const excerpt =
    poem.content.substring(0, 155).replace(/\n/g, " ").trim() +
    (poem.content.length > 155 ? "…" : "");
  const pageDescription =
    poem.description ?? `${excerpt} — a poem by Darshan Regmi.`;
  const pageUrl = `${SITE_URL}/poem/${poem.id}`;

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
    // openGraph.images / twitter.images are NOT set here — Next auto-injects
    // the file-based image from app/poem/[id]/opengraph-image.tsx (and
    // twitter-image.tsx) so every poem gets its own dynamic card.
    openGraph: {
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
      url: pageUrl,
      siteName: "i feel, therefore i write",
      type: "article",
      publishedTime: poem.createdAt,
      modifiedTime: poem.updatedAt,
      authors: ["Darshan Regmi"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
      site: "@Regmi6Darshan",
      creator: "@Regmi6Darshan",
    },
  };
}

export default async function PoemPage({ params }: { params: { id: string } }) {
  const poem: Poem | null = await getPoemById(params.id);

  if (!poem) {
    notFound();
  }

  // Sibling poems for internal linking (improves crawl depth)
  let related: Poem[] = [];
  try {
    const all = await getPoemsFromNotion();
    related = all.filter((p) => p.id !== poem.id).slice(0, 3);
  } catch {
    related = [];
  }

  const pageUrl = `${SITE_URL}/poem/${poem.id}`;

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
        image: `${SITE_URL}/default-og-image.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Poems", item: `${SITE_URL}/poem` },
          { "@type": "ListItem", position: 3, name: poem.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center p-6 sm:p-8 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl">
        <BackButtonWithScroll />

        <article className="w-full max-w-3xl mx-auto">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-center mb-8 text-gray-900 tracking-tight leading-tight px-4">
            {poem.title}
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Poem content */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative p-8 sm:p-10 md:p-12 bg-white rounded-3xl border border-gray-200 shadow-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-gray-800 whitespace-pre-line">
                <span className="text-gray-400 text-3xl leading-none">&ldquo;</span>
                {poem.content}
                <span className="text-gray-400 text-3xl leading-none">&rdquo;</span>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
                <LikeButton poemId={poem.id} />
                <Link
                  href="/about-the-author"
                  rel="author"
                  className="text-sm italic text-gray-500 hover:text-gray-900 transition-colors duration-200"
                >
                  — Darshan Regmi
                </Link>
              </div>
            </div>
          </div>

          {/* More poems — internal linking */}
          {related.length > 0 && (
            <section aria-label="More poems" className="mt-16">
              <h2 className="text-2xl font-serif text-center text-gray-900 mb-8">
                more poems
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/poem/${p.id}`}
                      className="block p-5 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <h3 className="font-serif text-lg text-gray-900 mb-2">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                        {p.content.split("\n").slice(0, 2).join(" ")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Bottom decorative line */}
          <div className="flex items-center justify-center gap-3 mt-12">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </article>
      </div>
    </main>
  );
}
