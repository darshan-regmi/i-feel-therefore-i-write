export const revalidate = 60;
export const runtime = 'edge';

import { Metadata } from "next";
import { getPoemById, type Poem } from "@/lib/notion";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButtonWithScroll from "@/components/BackButton_1";
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
      robots: { index: false, follow: false },
    };
  }

  const excerpt =
    poem.content.substring(0, 155).replace(/\n/g, " ").trim() +
    (poem.content.length > 155 ? "…" : "");
  const pageDescription =
    poem.description ?? `${excerpt} — a poem by Darshan Regmi.`;

  return {
    title: poem.title,
    description: pageDescription,
    // This route is behind auth — keep it out of the index, but point canonical
    // at the public detail page so any share links still consolidate signals.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/poem/${poem.id}` },
  };
}

export default async function PoemPage({ params }: { params: { id: string } }) {
  const poem: Poem | null = await getPoemById(params.id);

  if (!poem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl">
        <BackButtonWithScroll />

        <article className="w-full max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-center mb-8 text-gray-900 tracking-tight leading-tight px-4">
            {poem.title}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

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
