'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPoemsFromNotion } from '@/lib/notion'
import SearchBar from '@/components/SearchBar'

type Poem = {
  id: string
  title: string
  content: string
}

export default function SearchPage() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [results, setResults] = useState<Poem[]>([])

  useEffect(() => {
    async function fetchPoems() {
      const data = await getPoemsFromNotion()
      setPoems(data)
      setResults(data)
    }
    fetchPoems()
  }, [])

  return (
    <main className="min-h-screen p-6 text-gray-900 bg-white">
      <Link href="/" className="text-gray-500 hover:text-gray-800">← back to home</Link>
      <h1 className="text-3xl font-serif my-6">Search Poems</h1>

      <SearchBar poems={poems} onResults={setResults} />

      <ul className="space-y-4">
        {results.map((poem) => (
          <li key={poem.id} className="bg-blush p-4 rounded-xl shadow-sm">
            <Link href={`/poem/${poem.id}`}>
              <h2 className="text-xl font-medium">{poem.title}</h2>
              <p className="text-gray-700 mt-2">{poem.content.split('\n')[0]}...</p>
            </Link>
          </li>
        ))}
        {results.length === 0 && <p className="text-gray-500">No poems found.</p>}
      </ul>
    </main>
  )
}