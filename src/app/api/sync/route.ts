// app/api/sync/route.ts
// Runs on Cloudflare Pages (edge / Workers runtime). No Node APIs.
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getPoemsFromNotion } from '@/lib/notion';
import { listAllPoems, commitPoems } from '@/lib/firestoreRest';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const syncSecret = request.headers.get('x-sync-secret');
    if (!process.env.SYNC_SECRET || syncSecret !== process.env.SYNC_SECRET) {
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
        stats: { total: 0, added: 0, updated: 0, duration: Date.now() - startTime },
      });
    }

    // Snapshot every poem doc once so we can decide add vs. update vs. skip
    // without an extra round-trip per poem.
    const existing = await listAllPoems();

    type Write = Parameters<typeof commitPoems>[0][number];
    const writes: Write[] = [];
    let added = 0;
    let updated = 0;
    let unchanged = 0;

    const nowIso = new Date().toISOString();

    for (const poem of notionPoems) {
      const prev = existing.get(poem.id);

      if (!prev) {
        writes.push({
          id: poem.id,
          fields: {
            id: poem.id,
            title: poem.title,
            content: poem.content,
            likes: 0,
            createdAt: poem.createdAt,
            lastSynced: nowIso,
          },
          createOnly: true,
        });
        added++;
        continue;
      }

      const titleChanged = prev.title !== poem.title;
      const contentChanged = prev.content !== poem.content;
      if (titleChanged || contentChanged) {
        writes.push({
          id: poem.id,
          fields: {
            title: poem.title,
            content: poem.content,
            lastSynced: nowIso,
          },
          mask: ['title', 'content', 'lastSynced'],
        });
        updated++;
      } else {
        unchanged++;
      }
    }

    await commitPoems(writes);

    if (added > 0 || updated > 0) {
      revalidateTag('poems');
      revalidateTag('poem-likes');
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${notionPoems.length} poems`,
      stats: {
        notionTotal: notionPoems.length,
        firestoreTotal: existing.size,
        added,
        updated,
        unchanged,
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
