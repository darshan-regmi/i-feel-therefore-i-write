'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Poem = {
  id: string;
  title: string;
  content: string;
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PoemsList({ poems }: { poems: Poem[] }) {
  const [shuffledPoems, setShuffledPoems] = useState<Poem[] | null>(null);

  useEffect(() => {
    // Only shuffle once per hard refresh
    if (!shuffledPoems) {
      setShuffledPoems(shuffle(poems));
    }
  }, [poems]);

  if (!shuffledPoems) return null;

  return (
    <ul className="w-full max-w-2xl space-y-4">
      {shuffledPoems.map((poem) => (
        <li key={poem.id}>
          <div className="p-6 bg-blush rounded-2xl shadow text-lg font-light leading-relaxed cursor-pointer hover:shadow-md transition-shadow">
            <Link href={`/poem/${poem.id}`}>
              <div>
                <h2 className="text-xl mb-2 font-medium">{poem.title}</h2>
                <p>&ldquo;{poem.content.split('\n')[0]}&rdquo;</p>
              </div>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}