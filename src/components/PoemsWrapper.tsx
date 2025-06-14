'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const PoemsClient = dynamic(() => import('@/components/PoemClient'), {
  ssr: false,
})

type Poem = {
  id: string
  title: string
  content: string
}

export default function PoemsWrapper({ poems }: { poems: Poem[] }) {
  const pathname = usePathname()

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('poems-scroll')

    // Only restore scroll if we came back to the list route
    if (pathname === '/poem' && savedScroll !== null) {
      // Delay to ensure DOM renders first
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'auto' })
      }, 0)
    }

    return () => {
      sessionStorage.setItem('poems-scroll', String(window.scrollY))
    }
  }, [pathname])

  return <PoemsClient poems={poems} />
}