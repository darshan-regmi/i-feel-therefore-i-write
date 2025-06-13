export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import Link from "next/link";
import { Metadata } from "next";
import { getPoemById } from "@/lib/notion";
import { notFound } from "next/navigation";

interface PoemType {
  id: string;
  title: string;
  content: string;
}

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
    };
  }

  const pageDescription =
    poem.content.substring(0, 160).replace(/\n/g, " ").trim() +
    (poem.content.length > 160 ? "..." : "");
  const pageUrl = `https://poetry.darshanregmi.com.np/poem/${poem.id}`;

  return {
    title: poem.title,
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
      publishedTime: new Date().toISOString(),
      authors: ["Darshan Regmi"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poem.title} | i feel, therefore i write`,
      description: pageDescription,
    },
  };
}

export default async function PoemPage({
  params,
}: {
  params: { id: string };
}) {
  const poem: PoemType | null = await getPoemById(params.id);

  if (!poem) {
    notFound();
  }

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
        <div className="p-8 bg-blush rounded-2xl shadow-md text-xl font-light leading-relaxed whitespace-pre-line">
          {poem.content}
        </div>
      </article>
    </main>
  );
}