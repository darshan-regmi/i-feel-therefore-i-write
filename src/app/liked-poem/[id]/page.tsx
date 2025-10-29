export const revalidate = 60;
export const runtime = 'edge';

import { Metadata } from "next";
import { getPoemById } from "@/lib/notion";
import { notFound } from "next/navigation";
import BackButtonWithScroll from "@/components/BackButton_1";
import LikeButton from "@/components/LikeButton";
import { auth } from "@/lib/firebase";

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
  const pageUrl = `https://poetry.darshanregmi.com.np/liked-poem/${poem.id}`;

  return {
    title: `${poem.title} | i feel, therefore i write`,
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

export default async function PoemPage({ params }: { params: { id: string } }) {
  const poem: PoemType | null = await getPoemById(params.id);

  if (!poem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center p-6 sm:p-8 relative overflow-hidden">
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
            {/* Subtle gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative p-8 sm:p-10 md:p-12 bg-white rounded-3xl border border-gray-200 shadow-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-gray-800 whitespace-pre-line">
                <span className="text-gray-400 text-3xl leading-none">&ldquo;</span>
                {poem.content}
                <span className="text-gray-400 text-3xl leading-none">&rdquo;</span>
              </div>

              {/* Signature line */}
              <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
                <LikeButton
                  key={`${poem.id}-${auth.currentUser?.uid}`}
                  poemId={poem.id}
                />
                <div className="text-sm italic text-gray-500">
                  — Darshan Regmi
                </div>
              </div>
            </div>
          </div>

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