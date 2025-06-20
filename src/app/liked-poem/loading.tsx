// src/app/poem/loading.tsx

export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl p-8 rounded-xl shadow-sm border border-gray-200 animate-pulse bg-white">
        
        {/* Title Skeleton */}
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-6"></div>

        {/* Poem Skeleton Lines */}
        <div className="space-y-4">
          <div className="h-5 w-full bg-gray-100 rounded"></div>
          <div className="h-5 w-5/6 bg-gray-100 rounded"></div>
          <div className="h-5 w-2/3 bg-gray-100 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-100 rounded"></div>
          <div className="h-5 w-full bg-gray-100 rounded"></div>
          <div className="h-5 w-4/6 bg-gray-100 rounded"></div>
        </div>

        {/* Signature Line Skeleton */}
        <div className="mt-10 h-4 w-28 bg-gray-300 rounded-full mx-auto"></div>
      </div>

      {/* Loading Hint */}
      <p className="mt-8 text-sm italic text-gray-600 animate-pulse delay-1000">
        please wait — getting the poems for you...
      </p>
    </main>
  );
}