"use client";

import dynamic from "next/dynamic";

// Defers Firebase Auth + framer-motion + the Firestore likes lib until after
// hydration. Used by server-rendered poem pages so the initial bundle stays small.
const LikeButton = dynamic(() => import("./LikeButton"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 opacity-50 select-none">
      <div className="w-9 h-9 rounded-full bg-gray-100" />
      <span className="text-sm font-medium text-gray-400">—</span>
    </div>
  ),
});

export default function LikeButtonLazy({
  poemId,
  initialLikes,
}: {
  poemId: string;
  initialLikes?: number;
}) {
  return <LikeButton poemId={poemId} initialLikes={initialLikes} />;
}
