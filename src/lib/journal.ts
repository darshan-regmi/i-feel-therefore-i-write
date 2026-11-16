import type { Poem } from "./notion";

/** All displayed dates are the same calendar day on the server and in the browser. */
export const SITE_TIMEZONE = "Asia/Kathmandu";

export type Entry = {
  poem: Poem;
  /** Position by date, oldest first, zero-padded to three digits. */
  number: string;
  publishedAt: Date;
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: SITE_TIMEZONE,
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: SITE_TIMEZONE,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: SITE_TIMEZONE,
});

export function parsePoemDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

/** "14 nov 2026" */
export function formatLongDate(date: Date): string {
  return longDateFormatter.format(date).toLowerCase();
}

/** "14 nov" */
export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date).toLowerCase();
}

/** "november 2026" */
export function formatMonth(date: Date): string {
  return monthFormatter.format(date).toLowerCase();
}

/** "014" */
export function formatEntryNumber(position: number): string {
  return String(position).padStart(3, "0");
}

/**
 * Stable ordering for entries that share a timestamp: createdAt first, then the
 * Notion page id. Entry numbers and list order both use this comparator.
 */
function compareOldestFirst(a: Poem, b: Poem): number {
  const time = parsePoemDate(a.createdAt).getTime() - parsePoemDate(b.createdAt).getTime();
  if (time !== 0) return time;
  return a.id.localeCompare(b.id);
}

/** Every published poem with its entry number, oldest first. */
export function buildEntries(poems: Poem[]): Entry[] {
  return [...poems]
    .sort(compareOldestFirst)
    .map((poem, index) => ({
      poem,
      number: formatEntryNumber(index + 1),
      publishedAt: parsePoemDate(poem.createdAt),
    }));
}

/** Every published poem with its entry number, newest first. */
export function buildEntriesNewestFirst(poems: Poem[]): Entry[] {
  return buildEntries(poems).reverse();
}

export function entryShortMeta(entry: Entry): string {
  return `${entry.number} · ${formatShortDate(entry.publishedAt)}`;
}

export function entryLongMeta(entry: Entry): string {
  return `${entry.number} · ${formatLongDate(entry.publishedAt)}`;
}

/** Lowercase, accent-free, hyphenated title. The Notion id remains the identifier. */
export function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`"]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");

  return slug || "untitled";
}

export function poemSlug(poem: Poem): string {
  return `${slugifyTitle(poem.title)}-${poem.id}`;
}

export function poemHref(poem: Poem): string {
  return `/entries/${poemSlug(poem)}`;
}

/** The trailing Notion page id is the stable part of a poem URL. */
export function extractPoemId(slug: string): string | null {
  const match = slug.match(/([0-9a-f]{32})(?:-|$)/i);
  return match ? match[1].toLowerCase() : null;
}

export function isCanonicalPoemSlug(slug: string, poem: Poem): boolean {
  return slug === poemSlug(poem);
}

export function groupByMonth(entries: Entry[]): Array<{
  label: string;
  entries: Entry[];
}> {
  const groups: Array<{ label: string; entries: Entry[] }> = [];

  for (const entry of entries) {
    const label = formatMonth(entry.publishedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.entries.push(entry);
    } else {
      groups.push({ label, entries: [entry] });
    }
  }

  return groups;
}
