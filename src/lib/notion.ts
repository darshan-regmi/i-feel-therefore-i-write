// src/lib/notion.ts
import { Client } from '@notionhq/client'

const notion = new Client({
  auth:"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", // Consider moving to environment variables
})

const databaseId = "209419347bda80089684fc2ae3e15149"! // Consider moving to environment variables

export async function getPoemsFromNotion() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Content', // Assuming this is a date property for sorting, adjust if it's the text content itself
        direction: 'descending',
      },
    ],
  })

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
    content:
      page.properties.Content?.rich_text[0]?.plain_text || '(No content)',
  }))
}

export async function getPoemById(id: string) {
  const page = await notion.pages.retrieve({ page_id: id }) as any;
  // Basic error handling if page is not found or doesn't have expected structure
  if (!page || !page.properties || !page.properties.Title || !page.properties.Content) {
    console.error(`Poem with ID ${id} not found or has unexpected structure.`);
    return null; // Or throw an error, depending on how you want to handle this
  }
  return {
    id: page.id,
    title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
    content:
      page.properties.Content?.rich_text[0]?.plain_text || '(No content)',
  };
}

// New function to get all poem IDs
export async function getAllPoemIds(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      status: {
        equals: 'Published',
      },
    },
  });

  return response.results.map((page: any) => page.id);
}