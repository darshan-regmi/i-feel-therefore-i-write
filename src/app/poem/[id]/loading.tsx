// src/app/poem/[id]/loading.tsx

export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl p-8 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 rounded-2xl shadow-lg animate-pulse border border-rose-200">
        {/* Title Skeleton */}
        <div className="h-10 w-3/4 bg-rose-200/60 rounded mb-6"></div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-full bg-rose-100/60 rounded"></div>
          <div className="h-5 w-5/6 bg-rose-100/60 rounded"></div>
          <div className="h-5 w-2/3 bg-rose-100/60 rounded"></div>
          <div className="h-5 w-3/4 bg-rose-100/60 rounded"></div>
          <div className="h-5 w-full bg-rose-100/60 rounded"></div>
          <div className="h-5 w-4/6 bg-rose-100/60 rounded"></div>
        </div>

        {/* Signature Line Skeleton */}
        <div className="mt-10 h-4 w-32 bg-rose-200/50 rounded-full mx-auto"></div>
      </div>
    </main>
  );
}