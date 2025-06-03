import Link from 'next/link';
import { poems } from '@/data/poems';

export default function PoemsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <h1 className="text-4xl font-serif text-center mb-2">my poems</h1>
      <p className="text-gray-600 text-center max-w-xl mb-8">
        fragments of feeling, gathered gently — from me to you.
      </p>

      <ul className="w-full max-w-2xl space-y-4">
        {poems.map((poem) => (
          <li key={poem.id}>
            <Link href={`/poem/${poem.id}`}>
              <div className={`p-6 ${poem.backgroundColor ?? 'bg-blush'} rounded-2xl shadow text-lg font-light leading-relaxed cursor-pointer hover:shadow-md transition-shadow`}>
                <h2 className="text-xl mb-2 font-medium">{poem.title}</h2>
                <p>&ldquo;{poem.content.split('\n')[0]}&rdquo;</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}