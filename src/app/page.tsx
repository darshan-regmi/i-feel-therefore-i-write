import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "i feel, therefore i write",
  description:
    "Welcome to 'i feel, therefore i write,' a personal collection of poems by Darshan Regmi. Explore verses born from emotion and experience.",
  openGraph: {
    title: "i feel, therefore i write",
    description:
      "Welcome to 'i feel, therefore i write,' a personal collection of poems by Darshan Regmi. Explore verses born from emotion and experience.",
    url: "https://poetry.darshanregmi.com.np",
  },
  twitter: {
    title: "i feel, therefore i write",
    description:
      "Welcome to 'i feel, therefore i write,' a personal collection of poems by Darshan Regmi. Explore verses born from emotion and experience.",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-serif text-center">
        i feel, therefore i write
      </h1>
      <p className="mt-6 text-lg max-w-xl text-center text-gray-600">
        for anyone who&#39;s ever felt too much, or not enough.
      </p>

      <Link
        href="/poem"
        className="mt-8 px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition"
      >
        Start Reading
      </Link>
      <p className="mt-4 text-sm text-gray-500">
        <Link href="/aboutTheAuthor" className="hover:underline">
          About the Author
        </Link>
      </p>
    </main>
  );
}
