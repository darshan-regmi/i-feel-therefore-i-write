// Edge runtime (Cloudflare compatible)
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    if (!process.env.NOTION_API_KEY) {
      console.error('❌ NOTION_API_KEY is undefined!');
      return NextResponse.json({ success: false, error: 'Missing NOTION_API_KEY' });
    }

    console.log('✅ Sync route hit. Starting sync...');

    const poems = await getPoemsFromNotion();
    console.log(`✅ Found ${poems.length} poems.`);

    for (const poem of poems) {
      const poemRef = doc(db, 'poems', poem.id);
      const poemSnap = await getDoc(poemRef);

      // Only create the doc if it doesn't exist
      if (!poemSnap.exists()) {
        await setDoc(poemRef, {
          likes: 0,
        });
        console.log(`📝 Added new poem: ${poem.id}`);
      } else {
        console.log(`⚠️ Skipped existing poem: ${poem.id}`);
      }
    }

    return NextResponse.json({ success: true, message: 'Poems synced from Notion.' });
  } catch (error) {
    console.error('[SYNC ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message });
  }
}