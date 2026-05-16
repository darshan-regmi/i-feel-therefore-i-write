// src/lib/notion.ts
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { unstable_cache } from 'next/cache';

if (!process.env.NOTION_API_KEY) {
  throw new Error('Missing required environment variable: NOTION_API_KEY. See .env.example.');
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error('Missing required environment variable: NOTION_DATABASE_ID. See .env.example.');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

// Types
export interface Poem {
  id: string;
  title: string;
  content: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const poemCache = new Map<string, { poem: Poem; timestamp: number }>();
const allPoemsCache: { poems: Poem[]; timestamp: number } | null = null;

// Helper function to check cache validity
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Clear cache helper
export function clearCache() {
  poemCache.clear();
  console.log('🧹 Notion cache cleared');
}

/**
 * Query Notion database with pagination support
 */
async function queryDatabase(
  params: Omit<Parameters<typeof notion.databases.query>[0], 'database_id'>
): Promise<PageObjectResponse[]> {
  try {
    let results: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      const response = (await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        ...params,
      })) as QueryDatabaseResponse;

      results = results.concat(response.results as PageObjectResponse[]);
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
      pageCount++;

      console.log(`📄 Fetched page ${pageCount} (${response.results.length} items)`);
    } while (cursor);

    console.log(`✅ Total items fetched: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Error querying Notion database:', error);
    throw new Error(
      `Failed to query Notion database: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract poem data from Notion page
 */
function extractPoemFromPage(page: PageObjectResponse): Poem {
  try {
    const title =
      page.properties.Title?.type === 'title' && page.properties.Title.title[0]
        ? page.properties.Title.title[0].plain_text
        : 'Untitled';

    const content =
      page.properties.Content?.type === 'rich_text' &&
      page.properties.Content.rich_text[0]
        ? page.properties.Content.rich_text[0].plain_text
        : '(No content)';

    // Optional hand-written meta description. Notion property name: "Description"
    // (rich_text). Falls back to null so callers can substring `content` instead.
    const descriptionProp =
      page.properties.Description?.type === 'rich_text' &&
      page.properties.Description.rich_text.length > 0
        ? page.properties.Description.rich_text
            .map((t) => t.plain_text)
            .join('')
            .trim()
        : null;

    const createdAtProp =
      page.properties.CreatedAt?.type === 'created_time'
        ? page.properties.CreatedAt.created_time
        : undefined;

    return {
      id: page.id,
      title: title.trim(),
      content: content.trim(),
      description: descriptionProp && descriptionProp.length > 0 ? descriptionProp : null,
      createdAt: createdAtProp ?? page.created_time,
      updatedAt: page.last_edited_time,
    };
  } catch (error) {
    console.error(`❌ Error extracting poem from page ${page.id}:`, error);
    return {
      id: page.id,
      title: 'Error Loading Title',
      content: 'Error loading content',
      description: null,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
  }
}

async function fetchPoemsFromNotion(): Promise<Poem[]> {
  try {
    console.log('📚 Fetching all poems from Notion...');
    const startTime = Date.now();

    const pages = await queryDatabase({
      filter: {
        property: 'Status',
        status: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'CreatedAt',
          direction: 'descending',
        },
      ],
    });

    const poems = pages.map(extractPoemFromPage);
    const duration = Date.now() - startTime;

    console.log(`✅ Fetched ${poems.length} published poems (${duration}ms)`);
    return poems;
  } catch (error) {
    console.error('❌ Error fetching poems from Notion:', error);
    throw new Error(
      `Failed to fetch poems: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch all published poems, cached across requests via Next's data cache.
 * Revalidates every 5 minutes. Bust manually by hitting POST /api/revalidate
 * (which calls revalidatePath('/poem') and /poem/[id]).
 */
export const getPoemsFromNotion = unstable_cache(
  fetchPoemsFromNotion,
  ['all-published-poems'],
  { revalidate: 300, tags: ['poems'] }
);

// Notion page IDs are 32 hex chars, optionally formatted as 8-4-4-4-12 UUID.
const NOTION_ID_RE = /^[0-9a-f]{32}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve a single poem by page ID with caching. Returns null for any
 * fetch failure (invalid ID, network error, Notion 404) so callers can
 * cleanly fall through to `notFound()` without crashing the stream.
 */
export async function getPoemById(id: string): Promise<Poem | null> {
  if (!id || typeof id !== 'string' || !NOTION_ID_RE.test(id.trim())) {
    console.warn(`⚠️ Invalid Notion page ID shape: ${id}`);
    return null;
  }

  const cached = poemCache.get(id);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`💾 Cache hit for poem: ${id}`);
    return cached.poem;
  }

  try {
    console.log(`📖 Fetching poem from Notion: ${id}`);
    const startTime = Date.now();

    const page = (await notion.pages.retrieve({
      page_id: id,
    })) as PageObjectResponse;

    if (!page.properties.Title || !page.properties.Content) {
      console.error(`❌ Poem ${id} missing required properties`);
      return null;
    }

    const poem = extractPoemFromPage(page);
    const duration = Date.now() - startTime;

    poemCache.set(id, {
      poem,
      timestamp: Date.now(),
    });

    console.log(`✅ Fetched poem: ${id} - "${poem.title}" (${duration}ms)`);
    return poem;
  } catch (error) {
    console.warn(`⚠️ Poem fetch failed for ${id}:`, error);
    return null;
  }
}

/**
 * Return IDs for all published poems — useful for dynamic route generation.
 */
export async function getAllPoemIds(): Promise<string[]> {
  try {
    console.log('📋 Fetching all poem IDs...');
    const startTime = Date.now();

    const pages = await queryDatabase({
      filter: {
        property: 'Status',
        status: {
          equals: 'Published',
        },
      },
    });

    const ids = pages.map((page) => page.id);
    const duration = Date.now() - startTime;

    console.log(`✅ Fetched ${ids.length} poem IDs (${duration}ms)`);
    return ids;
  } catch (error) {
    console.error('❌ Error fetching poem IDs:', error);
    throw new Error(
      `Failed to fetch poem IDs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    poemCacheSize: poemCache.size,
    ttl: CACHE_TTL,
  };
}