"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { LikedPoemsProvider } from "./LikedPoemsProvider";

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

type Props = { poems: Poem[]; initialLikes?: Record<string, number> };

const PAGE_SIZE = 100;

export default function PoemsClient({ poems, initialLikes }: Props) {
  const [filtered, setFiltered] = useState<Poem[]>(poems);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination only when the underlying dataset changes — clearing a
  // search keeps whatever the user had already revealed so their scroll
  // position stays meaningful.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [poems]);

  const isSearching = query.trim() !== "";
  const visible = isSearching ? filtered : filtered.slice(0, visibleCount);
  const hasMore = !isSearching && visibleCount < filtered.length;

  // IntersectionObserver loads the next page when the sentinel scrolls into view.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const handleQueryChange = useCallback((q: string) => setQuery(q), []);

  // Restore scroll position when returning from a poem detail page
  useEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem("poems-scroll");
      if (savedScroll) {
        const scrollPosition = parseInt(savedScroll, 10);
        if (!isNaN(scrollPosition) && scrollPosition >= 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollPosition, behavior: "instant" });
          });
        }
        sessionStorage.removeItem("poems-scroll");
      }
    } catch (error) {
      console.error("Error restoring scroll position:", error);
      sessionStorage.removeItem("poems-scroll");
    }
  }, []);

  const saveScroll = () => {
    try {
      sessionStorage.setItem("poems-scroll", String(window.scrollY));
    } catch {
      // ignore
    }
  };

  return (
    <LikedPoemsProvider>
    <div className="w-full flex flex-col items-center">
      <SearchBar
        poems={poems}
        onResults={setFiltered}
        onQueryChange={handleQueryChange}
      />

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
          {visible.map((poem, index) => (
            <li
              key={poem.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
            >
              <article className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Link
                  href={`/poem/${poem.id}`}
                  onMouseDown={saveScroll}
                  onTouchStart={saveScroll}
                  className="relative z-10 block"
                  aria-label={`Read full poem: ${poem.title}`}
                >
                  <h2 className="text-2xl sm:text-3xl font-serif mb-4 text-gray-900 group-hover:text-black transition-colors duration-200">
                    {poem.title}
                  </h2>

                  <div className="relative">
                    <div className="relative max-h-[9.5rem] sm:max-h-[11rem] md:max-h-[13rem] overflow-hidden">
                      <p className="whitespace-pre-line break-words text-sm sm:text-base text-gray-700 leading-relaxed">
                        &ldquo;
                        {poem.content?.split("\n").slice(0, 4).join("\n") || ""}
                        &rdquo;
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  </div>
                </Link>

                <div className="mt-6 flex items-center justify-between relative z-10">
                  <LikeButton
                    poemId={poem.id}
                    initialLikes={initialLikes?.[poem.id] ?? 0}
                  />
                  <Link
                    href={`/poem/${poem.id}`}
                    onMouseDown={saveScroll}
                    onTouchStart={saveScroll}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group/btn"
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
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="w-full max-w-3xl px-4 py-8 flex justify-center"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            <span>loading more poems…</span>
          </div>
        </div>
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
    </LikedPoemsProvider>
  );
}
