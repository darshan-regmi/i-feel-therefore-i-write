export default function PoemsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <h1 className="text-4xl font-serif text-center mb-2">my poems</h1>
      <p className="text-gray-600 text-center max-w-xl mb-8">
        fragments of feeling, gathered gently — from me to you.
      </p>

      <ul className="w-full max-w-2xl space-y-4">
        <li className="p-6 bg-blush rounded-2xl shadow text-lg font-light leading-relaxed">
          “i am made of quiet fire.”
        </li>
        <li className="p-6 bg-blush rounded-2xl shadow text-lg font-light leading-relaxed">
          “each verse is a doorway.”
        </li>
      </ul>
    </main>
  );
}