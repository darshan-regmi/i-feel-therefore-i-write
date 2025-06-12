'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900 p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">This verse doesn’t exist...</h1>
      <p className="text-gray-600 max-w-md mb-6">
        This page doesn’t exist — or maybe it slipped between the lines of a poem never written.
        Wandered too far? Let’s guide you back to something beautiful.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        

        <Link
        href="/"
        className="mt-8 px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition"
      >
        Return Home
      </Link>
      <p className="mt-4 text-sm text-gray-500">
        <Link href="/poem" className="hover:underline">
          Explore Poems
        </Link>
      </p>
      <p className="mt-8 text-sm text-gray-500 italic">
        Or maybe you were meant to find this silence.
      </p>
      </div>
    </main>
  )
}