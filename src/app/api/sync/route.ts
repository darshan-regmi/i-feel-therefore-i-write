// app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  const startTime = Date.now();

  try {
    if (!process.env.NOTION_API_KEY) {
      console.error('❌ NOTION_API_KEY is undefined!');
      return NextResponse.json(
        { success: false, error: 'Missing NOTION_API_KEY configuration' },
        { status: 500 }
      );
    }

    console.log('🔄 Sync initiated at', new Date().toISOString());

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

    const batchSize = 500;

    for (let i = 0; i < poems.length; i += batchSize) {
      const batch = db.batch();  // ✅ db.batch()
      const batchPoems = poems.slice(i, i + batchSize);

      for (const poem of batchPoems) {
        try {
          if (!poem.id) {
            console.error('❌ Poem missing ID:', poem);
            errors.push(`Poem "${poem.title || 'unknown'}" is missing an ID`);
            continue;
          }

          // ✅ db.collection().doc()
          const poemRef = db.collection('poems').doc(poem.id);
          const poemSnap = await poemRef.get();

          if (!poemSnap.exists) {
            batch.set(poemRef, {
              id: poem.id,
              title: poem.title || '',
              content: poem.content || '',
              likes: 0,
              createdAt: new Date().toISOString(),
              lastSynced: new Date().toISOString(),
            });
            addedCount++;
            console.log(`✨ Queued new poem: ${poem.id} - "${poem.title}"`);
          } else {
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

    return NextResponse.json(
      { success: false, error: errorMessage, duration },
      { status: 500 }
    );
  }
}
