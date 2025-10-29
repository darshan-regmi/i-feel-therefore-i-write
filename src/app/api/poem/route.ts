export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';

export async function GET() {
  const startTime = Date.now();

  try {
    console.log('📖 Fetching poems from Notion at', new Date().toISOString());

    // Fetch poems from Notion
    const poems = await getPoemsFromNotion();

    if (!poems) {
      console.error('❌ getPoemsFromNotion returned null/undefined');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch poems',
          poems: [] 
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Successfully fetched ${poems.length} poems (${duration}ms)`);

    return NextResponse.json(
      {
        success: true,
        poems,
        count: poems.length,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [POEM API ERROR]', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      duration,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        poems: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}