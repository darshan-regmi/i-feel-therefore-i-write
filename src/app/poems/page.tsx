'use client'

import Link from 'next/link'

export default function LostPoemPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-serif font-bold mb-6">It seems you’ve wandered off...</h1>
      <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
        The poem you seek may have slipped into the shadows of forgotten verses,  
        or perhaps it’s waiting for you somewhere else along the path.  
        But don’t worry — there are still countless words waiting to be discovered.
      </p>
      <Link
        href="/poem"
        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        ← Return to the world of poems
      </Link>
    </main>
  )
}