export const runtime = 'edge';

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Cache tags used by unstable_cache wrappers around poems + like counts.
// Keep this list in sync with the `tags` option in:
//   - src/lib/notion.ts        (tag: "poems")
//   - src/lib/poemLikes.ts     (tag: "poem-likes")
const CACHE_TAGS = ['poems', 'poem-likes'] as const;

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate secret token
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET;

    if (!secret || secret !== expectedSecret) {
      console.warn('⚠️ Unauthorized revalidation attempt', {
        timestamp: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { success: false, error: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    console.log('🔄 Revalidation started at', new Date().toISOString());

    // Allow narrow invalidation via ?tag=poem-likes (repeatable). When omitted,
    // bust everything we know about.
    const requestedTags = req.nextUrl.searchParams.getAll('tag');
    const tagsToRevalidate =
      requestedTags.length > 0
        ? requestedTags.filter((t): t is (typeof CACHE_TAGS)[number] =>
            (CACHE_TAGS as readonly string[]).includes(t)
          )
        : [...CACHE_TAGS];

    const pathsToRevalidate = ['/poem', '/liked-poem'];

    const revalidationResults: Array<
      { kind: 'path' | 'tag'; name: string; status: 'success' | 'failed'; error?: string }
    > = [];

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
        revalidationResults.push({ kind: 'path', name: path, status: 'success' });
        console.log(`✅ Revalidated path: ${path}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        revalidationResults.push({ kind: 'path', name: path, status: 'failed', error: errorMsg });
        console.error(`❌ Failed to revalidate path ${path}:`, errorMsg);
      }
    }

    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        revalidationResults.push({ kind: 'tag', name: tag, status: 'success' });
        console.log(`✅ Revalidated tag: ${tag}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        revalidationResults.push({ kind: 'tag', name: tag, status: 'failed', error: errorMsg });
        console.error(`❌ Failed to revalidate tag ${tag}:`, errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    const successCount = revalidationResults.filter((r) => r.status === 'success').length;
    const failedCount = revalidationResults.filter((r) => r.status === 'failed').length;

    console.log(
      `✅ Revalidation completed: ${successCount} succeeded, ${failedCount} failed (${duration}ms)`
    );

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered successfully',
      stats: {
        paths: pathsToRevalidate.length,
        tags: tagsToRevalidate.length,
        succeeded: successCount,
        failed: failedCount,
        duration,
      },
      results: revalidationResults,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [REVALIDATION ERROR]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for webhook integration
export async function POST(req: NextRequest) {
  // Same logic as GET but can accept different payload formats
  return GET(req);
}