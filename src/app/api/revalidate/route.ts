export const runtime = 'edge';

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate secret token
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'my-secret-key';

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

    // Revalidate all relevant paths
    const pathsToRevalidate = [
      '/poem',           // Main poems list
      '/liked-poem',     // Liked poems page
      '/',               // Home page (if it shows poem data)
    ];

    const revalidationResults = [];

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
        revalidationResults.push({ path, status: 'success' });
        console.log(`✅ Revalidated: ${path}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        revalidationResults.push({ path, status: 'failed', error: errorMsg });
        console.error(`❌ Failed to revalidate ${path}:`, errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    const successCount = revalidationResults.filter(r => r.status === 'success').length;
    const failedCount = revalidationResults.filter(r => r.status === 'failed').length;

    console.log(`✅ Revalidation completed: ${successCount} succeeded, ${failedCount} failed (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered successfully',
      stats: {
        total: pathsToRevalidate.length,
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