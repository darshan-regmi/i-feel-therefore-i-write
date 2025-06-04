import type { Metadata } from 'next';
import Link from 'next/link';
import { poems } from '@/data/poems';
import LikeButton from '@/components/LikeButton';

export const metadata: Metadata = {
  title: "my poems",
  description: "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
  openGraph: {
    title: "All Poems | i feel, therefore i write",
    description: "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
    url: 'https://poetry.darshanregmi.com.np/poem',
  },
  twitter: {
    title: "All Poems | i feel, therefore i write",
    description: "Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.",
  }
};

export default function PoemsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <h1 className="text-4xl font-serif text-center mb-2">my poems</h1>
      <p className="text-gray-600 text-center max-w-xl mb-8">
        bits of emotion I&#39;ve carried, now passed gently to you.
      </p>

      <ul className="w-full max-w-2xl space-y-4">
        {poems.map((poem) => (
          <li key={poem.id}>
            <div className={`p-6 ${poem.backgroundColor ?? 'bg-blush'} rounded-2xl shadow text-lg font-light leading-relaxed cursor-pointer hover:shadow-md transition-shadow`}>
              <Link href={`/poem/${poem.id}`}>
                <div>
                  <h2 className="text-xl mb-2 font-medium">{poem.title}</h2>
                  <p>&ldquo;{poem.content.split('\n')[0]}&rdquo;</p><br />
                  <p className="text-gray-600 text-sm" style={{ display: 'flex', justifyContent: 'end'}}>
                    <span className="font-semibold">- @</span> {poem.author}
                  </p>
                </div>
              </Link>
              <div className='' style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                <LikeButton poemId={poem.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}