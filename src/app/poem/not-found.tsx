'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-center mb-6">Poem Not Found</h1>
      <p className="text-center text-gray-600 mb-6">
        The poem you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/poem"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        ← back to poems
      </Link>
    </main>
  )
}