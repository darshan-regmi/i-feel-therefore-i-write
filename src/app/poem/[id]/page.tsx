import { getPoemById, getAllPoemIds } from '@/data/poems';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const ids = getAllPoemIds(); // ['poem-1', 'poem-2']
  return ids.map(id => ({ id }));
}

export default async function PoemPage({ params }: { params: { id: string } }) {
  const poem = getPoemById(params.id);

  if (!poem) notFound();

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <Link href="/poem" className="self-start mb-8 text-gray-500 hover:text-gray-800 transition-colors">
        ← back to poems
      </Link>
      
      <article className="w-full max-w-2xl">
        <h1 className="text-4xl font-serif text-center mb-6">{poem.title}</h1>
        <div className={`p-8 ${poem.backgroundColor ?? 'bg-blush'} rounded-2xl shadow-md text-xl font-light leading-relaxed`}>
          {poem.content.split('\n').map((line, i) => (
            <p key={i} className="mb-4">{line}</p>
          ))}
        </div>
      </article>
    </main>
  );
}