"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900 px-6 py-12 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        this verse doesn&apos;t exist...
      </h1>

      <p className="text-gray-600 max-w-md mb-8 text-base sm:text-lg">
        this page doesn&apos;t exist — or maybe it slipped between the lines of
        a poem never written. <br />
        wandered too far? let&apos;s guide you back to something beautiful.
      </p>

      <div className="flex flex-col items-center gap-4 mb-6">
        <Link
          href="/poem"
          className="px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition duration-200"
        >
          explore poems
        </Link>

        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline transition duration-200"
        >
          return home
        </Link>
      </div>

      <p className="text-sm text-gray-400 italic">
        or maybe you were meant to find this silence.
      </p>
    </main>
  );
}
