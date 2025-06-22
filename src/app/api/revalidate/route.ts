export const runtime = 'edge';

import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== 'my-secret-key') {
    return new Response('Invalid token', { status: 401 });
  }

  try {
    revalidatePath('/poem'); // ⏱ This tells Next.js to re-render ISR for /poem

    return new Response('Revalidation triggered for /poem', {
      status: 200,
    });
  } catch (err) {
    console.error('Error revalidating:', err);
    return new Response('Failed to revalidate', { status: 500 });
  }
}