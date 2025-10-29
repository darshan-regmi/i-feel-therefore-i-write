"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const LikeButton = dynamic(() => import("@/components/LikeButton"), {
  ssr: false,
  loading: () => (
    <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
  ),
});

type Poem = {
  id: string;
  title: string;
  content: string;
};

type Props = { poems: Poem[] };

export default function PoemsClient({ poems }: Props) {
  const [filtered, setFiltered] = useState<Poem[]>(poems);

  const router = useRouter();

  const handleClick = (id: string) => {
    sessionStorage.setItem("poems-scroll", String(window.scrollY));
    router.push(`/poem/${id}`);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <SearchBar poems={poems} onResults={setFiltered} />

      {filtered.length === 0 ? (
        <div className="w-full max-w-2xl px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-600 font-light">
            No poems found matching your search.
          </p>
        </div>
      ) : (
        <ul className="w-full max-w-3xl space-y-6 px-4">
          {filtered.map((poem, index) => (
            <li
              key={poem.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <article className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div
                  onClick={() => handleClick(poem.id)}
                  className="cursor-pointer relative z-10"
                >
                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-serif mb-4 text-gray-900 group-hover:text-black transition-colors duration-200">
                    {poem.title}
                  </h2>

                  {/* Content preview */}
                  <div className="relative">
                    <div className="relative max-h-[9.5rem] sm:max-h-[11rem] md:max-h-[13rem] overflow-hidden">
                      <p className="whitespace-pre-line break-words text-sm sm:text-base text-gray-700 leading-relaxed">
                        &ldquo;
                        {poem.content?.split("\n").slice(0, 4).join("\n") || ""}
                        &rdquo;
                      </p>
                    </div>
                    {/* Gradient fade effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between relative z-10">
                  <LikeButton
                    key={`${poem.id}-${auth.currentUser?.uid}`}
                    poemId={poem.id}
                  />
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group/btn"
                    onClick={() => handleClick(poem.id)}
                    aria-label={`Read full poem: ${poem.title}`}
                  >
                    <span>Read more</span>
                    <svg
                      className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}