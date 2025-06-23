// Route to sync poems from Notion to Firestore

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const poems = await getPoemsFromNotion();

    for (const poem of poems) {
      const poemRef = doc(db, 'poems', poem.id); // Use Notion ID as Firestore doc ID

      await setDoc(poemRef, {
        poemId: poem.id,       // Firestore field (optional but useful)
        title: poem.title,
        content: poem.content,
        userId: 'system',       // or your UID if you're the author
        likes: 0,
        createdAt: new Date(),
      }, { merge: true }); // merge ensures updates don’t overwrite existing likes
    }

    return NextResponse.json({ success: true, message: 'Poems synced from Notion.' });
  } catch (error) {
  console.error('[SYNC ERROR]', error);

  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error';

  return NextResponse.json({ success: false, error: errorMessage });
}
}