import { getPoemById, getAllPoemIds } from "@/data/poems";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateStaticParams() {
  const ids = getAllPoemIds(); // e.g., ['poem-1', 'poem-2']
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const poem = await getPoemById(id);

  if (!poem) {
    return {
      title: "Poem Not Found",
      description: "The poem you are looking for could not be found.",
    };
  }

  const pageDescription =
    poem.content.substring(0, 160).replace(/\n/g, " ").trim() +
    (poem.content.length > 160 ? "..." : "");
  const pageUrl = `/poem/${poem.id}`;

  return {
    title: poem.title, // Will be combined with title.template from layout
    description: pageDescription,
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
      type: "article",
      publishedTime: new Date().toISOString(), // You might want to add a 'datePublished' field to your Poem interface
      authors: ["Darshan Regmi"],
      // If you have specific images for poems, you can add them here:
      // images: [
      //   {
      //     url: `/og-images/${poem.id}.png`, // Example: /public/og-images/poem-id.png
      //     width: 1200,
      //     height: 630,
      //     alt: poem.title,
      //   },
      // ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
      // images: [`/twitter-images/${poem.id}.png`], // Example: /public/twitter-images/poem-id.png
    },
  };
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poem = await getPoemById(id);

  if (!poem) notFound();

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <Link
        href="/poem"
        aria-label="Back to poems"
        className="self-start mb-8 text-gray-500 hover:text-gray-800 transition-colors"
      >
        ← back to poems
      </Link>

      <article className="w-full max-w-2xl">
        <h1 className="text-4xl font-serif text-center mb-6">{poem.title}</h1>
        <div
          className={`p-8 ${
            poem.backgroundColor ?? "bg-blush"
          } rounded-2xl shadow-md text-xl font-light leading-relaxed whitespace-pre-line`}
        >
          {poem.content}
        </div>
      </article>
    </main>
  );
}
