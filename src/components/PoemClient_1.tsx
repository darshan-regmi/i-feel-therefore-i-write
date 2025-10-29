"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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

type Props = {
  poems: Poem[];
};

export default function PoemsClient({ poems }: Props) {
  const [filtered, setFiltered] = useState<Poem[]>([]);
  const [likedPoemIds, setLikedPoemIds] = useState<Set<string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (!user || user.isAnonymous) {
        setLikedPoemIds(new Set());
        setIsLoading(false);
        return;
      }

      try {
        const likesRef = collection(db, "likes");
        const q = query(likesRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const likedIds = new Set<string>();
        snapshot.forEach((doc) => {
          likedIds.add(doc.data().poemId);
        });

        setLikedPoemIds(likedIds);
      } catch (error) {
        console.error("Failed to fetch likes:", error);
        setLikedPoemIds(new Set());
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (likedPoemIds !== null) {
      const likedPoems = poems.filter((poem) => likedPoemIds.has(poem.id));
      setFiltered(likedPoems);
    }
  }, [likedPoemIds, poems]);

  const handleClick = (id: string) => {
    sessionStorage.setItem("poems-scroll", String(window.scrollY));
    router.push(`/liked-poem/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 py-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 sm:p-8 bg-white rounded-2xl border border-gray-200"
              >
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filtered.length === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <svg
              className="w-10 h-10 text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-3">
            No liked poems yet
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start exploring poems and tap the heart icon to save your favorites
            here.
          </p>
          <button
            onClick={() => router.push("/poem")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>Explore Poems</span>
            <svg
              className="w-4 h-4"
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
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <SearchBar poems={filtered} onResults={setFiltered} />

      <ul className="w-full max-w-3xl space-y-6 px-4">
        {filtered.map((poem, index) => (
          <li
            key={poem.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <article className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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