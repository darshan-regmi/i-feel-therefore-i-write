export const revalidate = 60;
export const runtime = 'edge';

import type { Metadata } from 'next'
import Link from 'next/link'
import PoemsWrapper from '@/components/PoemsWrapper'

export const metadata: Metadata = {
  title: 'my poems',
  description:
    'Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.',
  openGraph: {
    title: 'All Poems | i feel, therefore i write',
    description:
      'Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.',
    url: 'https://poetry.darshanregmi.com.np/poem',
  },
  twitter: {
    title: 'All Poems | i feel, therefore i write',
    description:
      'Browse a collection of poems by Darshan Regmi. Discover verses on emotion, experience, and reflection.',
    images: [
      {
        url: 'https://poetry.darshanregmi.com.np/default-og-image.png',
      },
    ],
  },
}

export default async function PoemsPage() {
  try{
    const res = await fetch('https://poetry.darshanregmi.com.np/api/poem', {
      next: { revalidate: 60 },
    })

  const poems = await res.json()

    return (
      <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
        <Link
          href="/"
          aria-label="Back to home"
          className="self-start mb-8 text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← back to home
        </Link>

        <h1 className="text-4xl font-serif text-center mb-2">my poems</h1>
        <p className="text-gray-600 text-center max-w-xl mb-8">
          bits of emotion I&#39;ve carried, now passed gently to you.
        </p>

        <PoemsWrapper poems={poems} />
      </main>
    )
  } catch (error) {
    console.error(error)
  }
}
