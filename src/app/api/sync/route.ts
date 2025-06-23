export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
      await setDoc(poemRef, {
        poemId: poem.id,
        title: poem.title,
        content: poem.content,
        userId: 'system',
        likes: 0,
        createdAt: new Date(),
      }, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'Poems synced from Notion.' });
  } catch (error) {
    console.error('[SYNC ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message });
  }
}