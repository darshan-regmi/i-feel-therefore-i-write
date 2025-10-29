// Edge runtime (Cloudflare compatible)
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Validate environment variables
    if (!process.env.NOTION_API_KEY) {
      console.error('❌ NOTION_API_KEY is undefined!');
      return NextResponse.json(
        { success: false, error: 'Missing NOTION_API_KEY configuration' },
        { status: 500 }
      );
    }

    console.log('🔄 Sync initiated at', new Date().toISOString());

    // Fetch poems from Notion
    const poems = await getPoemsFromNotion();
    
    if (!poems || poems.length === 0) {
      console.warn('⚠️ No poems found in Notion');
      return NextResponse.json({
        success: true,
        message: 'No poems to sync',
        stats: {
          total: 0,
          added: 0,
          skipped: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    console.log(`📚 Found ${poems.length} poems from Notion`);

    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Use batch for better performance (max 500 operations per batch)
    const batchSize = 500;
    
    for (let i = 0; i < poems.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchPoems = poems.slice(i, i + batchSize);

      for (const poem of batchPoems) {
        try {
          if (!poem.id) {
            console.error('❌ Poem missing ID:', poem);
            errors.push(`Poem "${poem.title || 'unknown'}" is missing an ID`);
            continue;
          }

          const poemRef = doc(db, 'poems', poem.id);
          const poemSnap = await getDoc(poemRef);

          if (!poemSnap.exists()) {
            // Add new poem with initial data
            batch.set(poemRef, {
              likes: 0,
              title: poem.title || '',
              createdAt: new Date().toISOString(),
              lastSynced: new Date().toISOString(),
            });
            addedCount++;
            console.log(`✨ Queued new poem: ${poem.id} - "${poem.title}"`);
          } else {
            // Update last synced timestamp for existing poems
            batch.update(poemRef, {
              lastSynced: new Date().toISOString(),
            });
            skippedCount++;
            console.log(`✓ Existing poem: ${poem.id}`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Error processing poem ${poem.id}:`, errorMsg);
          errors.push(`Poem ${poem.id}: ${errorMsg}`);
        }
      }

      // Commit batch
      try {
        await batch.commit();
        console.log(`💾 Committed batch ${Math.floor(i / batchSize) + 1}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Batch commit failed:', errorMsg);
        errors.push(`Batch commit failed: ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    const successMessage = `Sync completed: ${addedCount} added, ${skippedCount} existing`;
    
    console.log(`✅ ${successMessage} (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: successMessage,
      stats: {
        total: poems.length,
        added: addedCount,
        skipped: skippedCount,
        errors: errors.length,
        duration,
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [SYNC ERROR]', error);
    
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
        duration,
      },
      { status: 500 }
    );
  }
}