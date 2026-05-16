'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { X, Search } from 'lucide-react'

type Poem = {
  id: string
  title: string
  content: string
}

type SearchBarProps = {
  poems: Poem[]
  onResults: (results: Poem[]) => void
  onQueryChange?: (query: string) => void
}

export default function SearchBar({ poems, onResults, onQueryChange }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [resultCount, setResultCount] = useState(poems.length)

  useEffect(() => {
    onQueryChange?.(query)
    if (!query) {
      onResults(poems)
      setResultCount(poems.length)
    } else {
      const fuse = new Fuse(poems, {
        keys: ['title', 'content'],
        threshold: 0.3,
      })
      const matches = fuse.search(query).map((result) => result.item)
      onResults(matches)
      setResultCount(matches.length)
    }
  }, [query, poems, onResults, onQueryChange])

  return (
    <div className="w-full max-w-2xl mb-8 space-y-3">
      <div className="relative group">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200">
          <Search size={20} />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search thoughts, titles, verses..."
          className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 placeholder:italic"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results counter */}
      {query && (
        <div className="text-center animate-fade-in">
          <p className="text-sm text-gray-500 italic">
            {resultCount === 0 ? (
              <span className="text-red-500">no poems found</span>
            ) : resultCount === 1 ? (
              <span>found <strong className="text-gray-700">1</strong> poem</span>
            ) : (
              <span>found <strong className="text-gray-700">{resultCount}</strong> poems</span>
            )}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}