// src/lib/notion.ts
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

// Validate environment variables
if (!process.env.NOTION_API_KEY) {
  throw new Error('NOTION_API_KEY is not defined in environment variables');
}

if (!process.env.NOTION_DATABASE_ID) {
  console.warn('⚠️ NOTION_DATABASE_ID not set, using fallback');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID || '209419347bda80089684fc2ae3e15149';

// Types
export interface Poem {
  id: string;
  title: string;
  content: string;
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

    return {
      id: page.id,
      title: title.trim(),
      content: content.trim(),
    };
  } catch (error) {
    console.error(`❌ Error extracting poem from page ${page.id}:`, error);
    return {
      id: page.id,
      title: 'Error Loading Title',
      content: 'Error loading content',
    };
  }
}

/**
 * Fetch all published poems. Sorted in descending order by CreatedAt.
 */
export async function getPoemsFromNotion(): Promise<Poem[]> {
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
 * Retrieve a single poem by page ID with caching.
 */
export async function getPoemById(id: string): Promise<Poem | null> {
  try {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('❌ Invalid poem ID provided:', id);
      return null;
    }

    // Check cache
    const cached = poemCache.get(id);
    if (cached && isCacheValid(cached.timestamp)) {
      console.log(`💾 Cache hit for poem: ${id}`);
      return cached.poem;
    }

    console.log(`📖 Fetching poem from Notion: ${id}`);
    const startTime = Date.now();

    const page = (await notion.pages.retrieve({
      page_id: id,
    })) as PageObjectResponse;

    // Check if page has the required properties
    if (!page.properties.Title || !page.properties.Content) {
      console.error(`❌ Poem ${id} missing required properties`);
      return null;
    }

    const poem = extractPoemFromPage(page);
    const duration = Date.now() - startTime;

    // Cache the result
    poemCache.set(id, {
      poem,
      timestamp: Date.now(),
    });

    console.log(`✅ Fetched poem: ${id} - "${poem.title}" (${duration}ms)`);
    return poem;
  } catch (error) {
    console.error(`❌ Error fetching poem ${id}:`, error);
    
    // Check if it's a not found error
    if (error instanceof Error && error.message.includes('Could not find page')) {
      console.warn(`⚠️ Poem not found: ${id}`);
      return null;
    }

    throw new Error(
      `Failed to fetch poem: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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