'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/liked-poem')
  }

  return (
    <button
      onClick={handleBack}
      className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 self-start mb-6"
      aria-label="Go back to liked poems"
    >
      <span className="group-hover:-translate-x-1 transition-transform duration-300">
        ←
      </span>
      <span>liked poems</span>
    </button>
  )
}