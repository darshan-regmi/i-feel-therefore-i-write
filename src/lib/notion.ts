// src/lib/notion.ts
import { Client } from '@notionhq/client'
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = "209419347bda80089684fc2ae3e15149"!

async function queryDatabase(
  params: Omit<Parameters<typeof notion.databases.query>[0], 'database_id'>
) {
  let results: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = (await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      ...params,
    })) as QueryDatabaseResponse;

    results = results.concat(response.results as PageObjectResponse[]);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
}

/**
 * Fetch all published poems. Sorted in descending order by the "Updated time" property.
 */
export async function getPoemsFromNotion() {
  const pages = await queryDatabase({
    filter: {
      property: 'Status',
      status: {
        equals: 'Published',
      },
    },
    sorts: [
      {
        property: 'UpdatedAt',
        direction: 'descending',
      },
    ],
  });

  return pages.map((page) => {
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
      title,
      content,
    };
  });
}

/**
 * Retrieve a single poem by page ID.
 */
const poemCache = new Map<string, { id: string; title: string; content: string }>();

export async function getPoemById(id: string) {
  if (poemCache.has(id)) return poemCache.get(id)!;

  const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse;

  const title =
    page.properties.Title?.type === 'title' && page.properties.Title.title[0]
      ? page.properties.Title.title[0].plain_text
      : 'Untitled';

  const content =
    page.properties.Content?.type === 'rich_text' && page.properties.Content.rich_text[0]
      ? page.properties.Content.rich_text[0].plain_text
      : '(No content)';

  const poem = { id: page.id, title, content };
  poemCache.set(id, poem);
  return poem;
}

/**
 * Return IDs for all published poems — useful for dynamic route generation (e.g., getStaticPaths).
 */
export async function getAllPoemIds(): Promise<string[]> {
  const pages = await queryDatabase({
    filter: {
      property: 'Status',
      status: {
        equals: 'Published',
      },
    },
  });

  return pages.map((page) => page.id);
}
