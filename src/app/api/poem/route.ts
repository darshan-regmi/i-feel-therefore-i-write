
import { NextResponse } from 'next/server'
import { getPoemsFromNotion } from '@/lib/notion'

export const dynamic = 'force-dynamic'

export async function GET() {
  const poems = await getPoemsFromNotion()
  return NextResponse.json(poems)
}