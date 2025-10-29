export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getPoemById } from "@/lib/notion";

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // Validate poem ID
    if (!params.id || typeof params.id !== 'string' || params.id.trim() === '') {
      console.warn('⚠️ Invalid poem ID provided:', params.id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid poem ID provided' 
        },
        { status: 400 }
      );
    }

    console.log(`📖 Fetching poem: ${params.id} at`, new Date().toISOString());

    // Fetch poem from Notion
    const poem = await getPoemById(params.id);

    if (!poem) {
      const duration = Date.now() - startTime;
      console.warn(`⚠️ Poem not found: ${params.id} (${duration}ms)`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Poem not found' 
        },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Successfully fetched poem: ${params.id} - "${poem.title}" (${duration}ms)`);

    return NextResponse.json(
      {
        success: true,
        poem,
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
    console.error(`❌ [POEM API ERROR] ID: ${params.id}`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      id: params.id,
      message: errorMessage,
      stack: errorStack,
      duration,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch poem',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}