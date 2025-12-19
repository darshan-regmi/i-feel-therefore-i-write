// app/api/sync/route.ts
// ✅ Simple: Add missing poem IDs only (Node.js runtime - firebase-admin)

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  const startTime = Date.now();

  try {
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing NOTION_API_KEY' },
        { status: 500 }
      );
    }

    console.log('🔄 Simple sync initiated');

    // Get all Notion poem IDs
    const notionPoems = await getPoemsFromNotion();
    if (!notionPoems?.length) {
      return NextResponse.json({
        success: true,
        message: 'No poems in Notion',
        stats: { total: 0, added: 0, duration: Date.now() - startTime }
      });
    }

    const notionIds = notionPoems.map(poem => poem.id);
    console.log(`📚 Found ${notionIds.length} Notion poem IDs`);

    // Get all existing Firestore poem IDs
    const firestoreSnapshot = await db.collection('poems').get();
    const firestoreIds = firestoreSnapshot.docs.map(doc => doc.id);
    console.log(`🔍 Found ${firestoreIds.length} Firestore poems`);

    // Find missing poems
    const missingIds = notionIds.filter(id => !firestoreIds.includes(id));
    console.log(`➕ Missing poems to add: ${missingIds.length}`);

    let addedCount = 0;
    const errors: string[] = [];

    if (missingIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All poems already exist',
        stats: {
          total: notionIds.length,
          missing: 0,
          added: 0,
          duration: Date.now() - startTime
        }
      });
    }

    // Add missing poems in batches
    const batchSize = 500;
    for (let i = 0; i < missingIds.length; i += batchSize) {
      const batch = db.batch();
      const batchIds = missingIds.slice(i, i + batchSize);

      for (const id of batchIds) {
        const poem = notionPoems.find(p => p.id === id);
        if (poem) {
          const poemRef = db.collection('poems').doc(id);
          batch.set(poemRef, {
            id: id,
            title: poem.title || '',
            content: poem.content || '',
            likes: 0,
            createdAt: new Date().toISOString(),
            lastSynced: new Date().toISOString(),
          });
        }
      }

      await batch.commit();
      addedCount += batchIds.length;
      console.log(`💾 Added batch ${Math.floor(i / batchSize) + 1}: ${batchIds.length} poems`);
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Added ${addedCount} missing poems (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: `Added ${addedCount} missing poems`,
      stats: {
        notionTotal: notionIds.length,
        firestoreTotal: firestoreIds.length,
        missing: missingIds.length,
        added: addedCount,
        duration
      },
      errors: errors.length ? errors : undefined,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Sync error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      },
      { status: 500 }
    );
  }
}
