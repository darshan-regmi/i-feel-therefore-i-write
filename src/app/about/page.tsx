import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { getBooks } from "@/lib/books";
import AuthLink from "@/components/journal/AuthLink";
import PageShell from "@/components/journal/PageShell";

export const revalidate = 300;
export const runtime = "edge";

export const metadata: Metadata = {
  title: "About the Author",
  description:
    "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About the Author",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
    url: `${SITE_URL}/about`,
    images: [
      {
        url: `${SITE_URL}/author.jpg`,
        width: 800,
        height: 1000,
        alt: "Darshan Regmi - Poetry Author",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About the Author | i feel, therefore i write",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write.",
    images: [`${SITE_URL}/author.jpg`],
  },
};

function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/about#profilepage`,
    url: `${SITE_URL}/about`,
    name: "About the Author",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    about: { "@id": `${SITE_URL}/#person` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/home` },
        { "@type": "ListItem", position: 2, name: "About the Author", item: `${SITE_URL}/about` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function AboutPage() {
  const books = await getBooks();

  return (
    <>
      <JsonLd />
      <PageShell parent="/home">
        <h1 className="page-title">about the author</h1>

        <div className="about-copy">
          <p>
            Hey, I’m Darshan Regmi. I write poems to feel, to heal, and to
            remember. My words are born from quiet nights, soft love, and the
            kind of memories that linger.
          </p>
          <p>
            I’m finishing my poetry book, “If Only You Knew”, which will soon be
            published — a tender journey through love, loss, and the slow,
            beautiful act of becoming whole again.
          </p>
          <p>
            Find me here:{" "}
            <a
              href="https://instagram.com/_darshan_regmi"
              target="_blank"
              rel="noopener noreferrer"
            >
              instagram
            </a>
          </p>
        </div>

        {books.length > 0 ? (
          <section className="about-books" aria-label="books">
            <p className="meta">books</p>
            <div className="book-list">
              {books.map((book) => (
                <div key={book.id} className="book-item">
                  {book.url ? (
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-title"
                    >
                      {book.title}
                    </a>
                  ) : (
                    <span className="book-title">{book.title}</span>
                  )}
                  <span className="book-status meta">{book.status}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="page-footer">
          <Link href="/entries">all entries</Link>
          <AuthLink />
        </footer>
      </PageShell>
    </>
  );
}
