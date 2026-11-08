// app/api/sync/route.ts
// Runs on Cloudflare Pages (edge / Workers runtime). No Node APIs.
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getPoemsFromNotion } from '@/lib/notion';
import { listAllPoems, commitPoems } from '@/lib/firestoreRest';
import { verifyTotp } from '@/lib/totp';

/**
 * Upsert every published Notion poem into Firestore.
 *
 * Two callers, two credentials:
 *   GET  — Cloudflare cron, authenticated with x-sync-secret (SYNC_SECRET)
 *   POST — the /qwzx confessional, authenticated with a TOTP code
 *
 * The poem content itself is still read from Notion by the pages; Firestore
 * holds the per-poem mirror that likes live on.
 */
async function runSync(): Promise<NextResponse> {
  const startTime = Date.now();

  try {
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

/** Cron path — unchanged behaviour, static shared secret. */
export async function GET(request: Request) {
  const syncSecret = request.headers.get('x-sync-secret');
  if (!process.env.SYNC_SECRET || syncSecret !== process.env.SYNC_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return runSync();
}

/** Human path — a TOTP code from the password manager, verified server-side. */
export async function POST(request: Request) {
  const secret = process.env.SYNC_TOTP_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'Sync is not configured' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let code = request.headers.get('x-sync-code')?.trim() ?? '';

  if (!code) {
    try {
      const body = (await request.json()) as { code?: unknown } | null;
      if (body && typeof body.code === 'string') code = body.code.trim();
    } catch {
      // No/invalid JSON body — fall through to the 401 below.
    }
  }

  const authorized = code.length > 0 && (await verifyTotp(secret, code));
  if (!authorized) {
    // Never distinguish "expired" from "wrong"; never log the code.
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = await runSync();
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
