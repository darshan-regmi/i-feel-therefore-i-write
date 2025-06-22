'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/poem')
  }

  return (
    <button
      onClick={handleBack}
      className="self-start mb-6 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer group"
    >
      ← back to poems
    </button>
  )
}