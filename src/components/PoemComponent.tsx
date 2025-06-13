"use client";

import { useEffect, useState } from "react";

interface PoemType {
  id: string;
  title: string;
  content: string;
}

interface PoemContentProps {
  id: string;
}

export default function PoemContent({ id }: PoemContentProps) {
  const [poem, setPoem] = useState<PoemType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoem() {
      setLoading(true);
      try {
        const res = await fetch(`/api/poem/${id}`); // You might need an API route for this
        if (!res.ok) throw new Error("Failed to fetch poem");
        const data = await res.json();
        setPoem(data);
      } catch (error) {
        console.log(error);
        setPoem(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPoem();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl p-8 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 rounded-2xl shadow-lg animate-pulse border border-rose-200">
  {/* Title Skeleton */}
  <div className="h-10 w-3/4 bg-rose-200/60 rounded mb-6"></div>

  {/* Content Skeleton */}
  <div className="space-y-4">
    <div className="h-5 w-full bg-rose-100/60 rounded"></div>
    <div className="h-5 w-5/6 bg-rose-100/60 rounded"></div>
    <div className="h-5 w-2/3 bg-rose-100/60 rounded"></div>
    <div className="h-5 w-3/4 bg-rose-100/60 rounded"></div>
    <div className="h-5 w-full bg-rose-100/60 rounded"></div>
    <div className="h-5 w-4/6 bg-rose-100/60 rounded"></div>
  </div>

  {/* Signature Line Skeleton */}
  <div className="mt-10 h-4 w-32 bg-rose-200/50 rounded-full mx-auto"></div>
</div>
    );
  }

  if (!poem) {
    return <p>Poem not found.</p>;
  }

  return (
    <article className="w-full max-w-2xl">
      <h1 className="text-4xl font-serif text-center mb-6">{poem.title}</h1>
      <div className="p-8 bg-blush rounded-2xl shadow-md text-xl font-light leading-relaxed whitespace-pre-line">
        {poem.content}
      </div>
    </article>
  );
}