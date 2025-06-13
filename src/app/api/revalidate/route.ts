import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== 'my-secret-key') {
    return new Response('Invalid token', { status: 401 })
  }

  try {
    await fetch(`https://poetry.darshanregmi.com.np/poem`, {
      method: 'PURGE',
    })

    return new Response('Revalidation requested', { status: 200 })
  } catch (err) {
    console.error("Revalidation error:", err)
    return new Response('Failed to revalidate', { status: 500 })
  }
}