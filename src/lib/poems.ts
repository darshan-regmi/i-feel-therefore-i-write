import { cache } from "react";
import { getPoemsFromNotion, type Poem } from "./notion";
import {
  buildEntries,
  buildEntriesNewestFirst,
  extractPoemId,
  slugifyTitle,
  type Entry,
} from "./journal";

export const POEMS_REVALIDATE = 300;

function newestFirst(a: Poem, b: Poem): number {
  const time = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  if (time !== 0) return time;
  return a.id.localeCompare(b.id);
}

/**
 * Every published poem, newest first. Notion remains the source of truth; the
 * Firestore mirror is written once a day and cannot be trusted for fresh edits.
 * `getPoemsFromNotion` already caches for 300 seconds and carries the "poems"
 * cache tag, so this layer only dedupes within a single request.
 */
export const getPoems = cache(async (): Promise<Poem[]> => {
  const poems = await getPoemsFromNotion();
  return [...poems].sort(newestFirst);
});

/** Newest-first entries with their stable 3-digit journal numbers. */
export const getEntries = cache(async (): Promise<Entry[]> => {
  return buildEntriesNewestFirst(await getPoems());
});

/**
 * Resolve a poem URL. The trailing Notion id is the stable identifier; the
 * title before it is cosmetic. A bare title slug still works when it is unique,
 * and a bare Notion id keeps older links working.
 */
export const getPoem = cache(async (slug: string): Promise<Poem | null> => {
  const poems = await getPoems();
  const id = extractPoemId(slug);

  if (id) {
    return poems.find((poem) => poem.id === id) ?? null;
  }

  if (/^[0-9a-f]{32}$/i.test(slug)) {
    const lower = slug.toLowerCase();
    return poems.find((poem) => poem.id === lower) ?? null;
  }

  const matches = poems.filter((poem) => slugifyTitle(poem.title) === slug);
  return matches.length === 1 ? matches[0] : null;
});

export async function getPoemNavigation(poem: Poem): Promise<{
  entry: Entry | null;
  previous: Entry | null;
  next: Entry | null;
}> {
  const entries = buildEntries(await getPoems());
  const index = entries.findIndex((entry) => entry.poem.id === poem.id);

  if (index < 0) {
    return { entry: null, previous: null, next: null };
  }

  return {
    entry: entries[index],
    previous: index > 0 ? entries[index - 1] : null,
    next: index < entries.length - 1 ? entries[index + 1] : null,
  };
}
