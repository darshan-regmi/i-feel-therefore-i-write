import { getPoemById, getAllPoemIds } from '@/data/poems';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const ids = getAllPoemIds(); // e.g., ['poem-1', 'poem-2']
  return ids.map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const poem = await getPoemById(params.id);
  if (!poem) return { title: 'Poem Not Found' };

  return {
    title: `${poem.title} | Poetry by Darshan`,
    description: poem.content.slice(0, 150).replace(/\n/g, ' ') + '...',
  };
}

export default async function PoemPage({ params }: { params: { id: string } }) {
  const poem = await getPoemById(params.id);

  if (!poem) notFound();

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <Link
        href="/poem"
        aria-label="Back to poems"
        className="self-start mb-8 text-gray-500 hover:text-gray-800 transition-colors"
      >
        ← back to poems
      </Link>

      <article className="w-full max-w-2xl">
        <h1 className="text-4xl font-serif text-center mb-6">{poem.title}</h1>
        <div
          className={`p-8 ${poem.backgroundColor ?? 'bg-blush'} rounded-2xl shadow-md text-xl font-light leading-relaxed whitespace-pre-line`}
        >
          {poem.content}
        </div>
      </article>
    </main>
  );
}