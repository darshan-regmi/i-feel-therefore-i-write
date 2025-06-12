'use client'

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
  return <PoemsClient poems={poems} />
}