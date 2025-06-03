export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-serif text-center">
        i feel, therefore i write
      </h1>
      <p className="mt-6 text-lg max-w-xl text-center text-gray-600">
        for anyone who’s ever felt too much, or not enough.
      </p>
    
      <a
        href="/poem"
        className="mt-8 px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition"
      >
        Start Reading
      </a>
    </main>
  );
}