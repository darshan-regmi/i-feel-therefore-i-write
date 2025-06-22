"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

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

      <ul className="w-full max-w-2xl space-y-4 px-4">
        {filtered.map((poem) => (
          <li key={poem.id}>
            <div className="p-6 bg-blush rounded-2xl shadow text-base sm:text-lg leading-relaxed hover:shadow-md transition-shadow">
              <div
                onClick={() => handleClick(poem.id)}
                className="cursor-pointer group rounded-xl "
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif mb-2 text-gray-900 group-hover:text-black transition">
                  {poem.title}
                </h2>

                <div className="relative max-h-[9.5rem] sm:max-h-[11rem] md:max-h-[13rem] overflow-hidden">
                  <p className="whitespace-pre-line break-words text-sm sm:text-base text-gray-800 leading-snug sm:leading-normal">
                    &ldquo;
                    {poem.content?.split("\n").slice(0, 4).join("\n") || ""}
                    &rdquo;
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <LikeButton
                  key={`${poem.id}-${auth.currentUser?.uid}`}
                  poemId={poem.id}
                />
                <div
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer group"
                  onClick={() => handleClick(poem.id)}
                >
                  Read more →
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
