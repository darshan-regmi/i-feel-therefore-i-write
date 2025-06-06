'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import SearchBar from './SearchBar'

const LikeButton = dynamic(() => import('@/components/LikeButton'), {
  ssr: false,
  loading: () => (
    <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse mr-2" />
  ),
})

type Poem = {
  id: string
  title: string
  content: string
}

type Props = { poems: Poem[] }

export default function PoemsClient({ poems }: Props) {
  const [filtered, setFiltered] = useState<Poem[]>(poems)

  return (
    <div className="w-full flex flex-col items-center">
      <SearchBar poems={poems} onResults={setFiltered} />

      <ul className="w-full max-w-2xl space-y-4">
        {filtered.map((poem) => (
          <li key={poem.id}>
            <div className="p-6 bg-blush rounded-2xl shadow text-lg leading-relaxed hover:shadow-md transition-shadow">
              <Link href={`/poem/${poem.id}`}>
                <h2 className="text-xl mb-2 font-medium">{poem.title}</h2>
                <p>&ldquo;{poem.content?.split('\n')[0] || ''}&rdquo;</p>
              </Link>

              <div className="mt-4 flex items-center">
                <LikeButton poemId={poem.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}