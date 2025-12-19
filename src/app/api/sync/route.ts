// app/api/sync/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getPoemsFromNotion } from '@/lib/notion';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // ✅ Security: Validate sync secret
    const syncSecret = request.headers.get('syncSecret');
    if (syncSecret !== process.env.SYNC_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notionPoems = await getPoemsFromNotion();
    if (!notionPoems?.length) {
      return NextResponse.json({
        success: true,
        message: 'No poems in Notion',
        stats: { total: 0, added: 0, duration: Date.now() - startTime }
      });
    }

    const notionIds = notionPoems.map(poem => poem.id);
    console.log(`📚 ${notionIds.length} Notion poems`);

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
    const firestoreIds = await getAllFirestoreIds(projectId, apiKey);
    console.log(`🔍 ${firestoreIds.length} Firestore poems`);

    const missingIds = notionIds.filter(id => !firestoreIds.includes(id));
    console.log(`➕ Adding ${missingIds.length} missing poems`);

    let addedCount = 0;
    const errors: string[] = [];

    for (const id of missingIds.slice(0, 30)) {
      try {
        const poem = notionPoems.find(p => p.id === id);
        if (!poem) continue;

        const docPath = `projects/${projectId}/databases/(default)/documents/poems`;
        const createUrl = `https://firestore.googleapis.com/v1/${docPath}?documentId=${id}&key=${apiKey}`;

        const poemData = {
          fields: {
            id: { stringValue: id },
            title: { stringValue: poem.title || '' },
            content: { stringValue: poem.content || '' },
            likes: { integerValue: '0' },
            // ✅ No userId - sync poems don't have owner
            createdAt: { stringValue: new Date().toISOString() },
            lastSynced: { stringValue: new Date().toISOString() },
          }
        };

        // ✅ Include sync secret in headers
        const response = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': process.env.SYNC_SECRET!,
          },
          body: JSON.stringify(poemData),
        });

        if (response.ok) {
          addedCount++;
          console.log(`✨ Added: ${id}`);
        } else {
          const errorText = await response.text();
          errors.push(`Failed ${id}`);
        }
      } catch (error) {
        errors.push(`Error ${id}`);
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Added ${addedCount}/${missingIds.length} missing poems`,
      stats: {
        notionTotal: notionIds.length,
        firestoreTotal: firestoreIds.length,
        missing: missingIds.length,
        added: addedCount,
        duration,
      },
      errors: errors.length ? errors.slice(0, 5) : undefined,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

async function getAllFirestoreIds(projectId: string, apiKey: string): Promise<string[]> {
  let allIds: string[] = [];
  let nextPageToken: string | null = null;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/poems?pageSize=100${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.documents) {
      allIds.push(...data.documents.map((doc: any) => doc.name.split('/').pop()!));
    }

    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  return allIds;
}
