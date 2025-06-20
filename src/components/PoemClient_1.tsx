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
    <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse mr-2" />
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

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) {
        setLikedPoemIds(new Set());
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
      }
    });

    return () => unsubscribe();
  }, []); // ✅ KEEP this as [] (auth listener auto re-runs on UID change)

  useEffect(() => {
    if (likedPoemIds !== null) {
      const likedPoems = poems.filter((poem) => likedPoemIds.has(poem.id));
      setFiltered(likedPoems);
    }
  }, [likedPoemIds]); // only re-run when likedPoemIds is set

  const handleClick = (id: string) => {
    sessionStorage.setItem("poems-scroll", String(window.scrollY));
    router.push(`/liked-poem/${id}`);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <SearchBar poems={filtered} onResults={setFiltered} />

      <ul className="w-full max-w-2xl space-y-4 px-4">
        {filtered.map((poem) => (
          <li key={poem.id}>
            <div className="p-6 bg-blush rounded-2xl shadow text-base sm:text-lg leading-relaxed hover:shadow-md transition-shadow">
              <div
                onClick={() => handleClick(poem.id)}
                className="cursor-pointer group"
              >
                <h2 className="text-2xl sm:text-3xl mb-2 font-serif">
                  {poem.title}
                </h2>

                <div className="relative max-h-[10.5rem] overflow-hidden">
                  <p className="whitespace-pre-line break-words text-gray-800">
                    &ldquo;
                    {poem.content?.split("\n").slice(0, 4).join("\n") || ""}
                    &rdquo;
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <LikeButton poemId={poem.id} />
                  <span className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    Read more →
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
