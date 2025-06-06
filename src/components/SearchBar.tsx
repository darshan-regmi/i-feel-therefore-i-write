'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { X } from 'lucide-react'

type Poem = {
  id: string
  title: string
  content: string
}

type SearchBarProps = {
  poems: Poem[]
  onResults: (results: Poem[]) => void
}

export default function SearchBar({ poems, onResults }: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!query) {
      onResults(poems)
    } else {
      const fuse = new Fuse(poems, {
        keys: ['title', 'content'],
        threshold: 0.3,
      })
      const matches = fuse.search(query).map((result) => result.item)
      onResults(matches)
    }
  }, [query, poems])

  return (
    <div className="relative w-full max-w-xl mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search thoughts, titles, verses..."
        className="w-full pl-4 pr-10 py-2.5 text-sm sm:text-base border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}