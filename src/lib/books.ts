import { unstable_cache } from "next/cache";
import { listBooks } from "./firestoreRest";

export type Book = {
  id: string;
  title: string;
  status: string;
  url: string | null;
  order: number;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function toBook(doc: Record<string, unknown> & { id: string }): Book | null {
  const title = text(doc.title);
  // `status` is the documented field; `label` is accepted for older rows.
  const status = text(doc.status) || text(doc.label);
  const url = safeUrl(doc.url) ?? safeUrl(doc.link);
  const order = typeof doc.order === "number" && Number.isFinite(doc.order) ? doc.order : 9999;

  // Required display values. A row with either missing is hidden entirely.
  if (!title || !status) return null;

  return { id: doc.id, title, status, url, order };
}

/**
 * Books are optional and read with the server's service account, so the page
 * keeps working before any public Firestore rule exists for `books`.
 */
export const getBooks = unstable_cache(
  async (): Promise<Book[]> => {
    try {
      const docs = await listBooks();
      return docs
        .map(toBook)
        .filter((book): book is Book => book !== null)
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.title.localeCompare(b.title);
        });
    } catch (error) {
      console.error("Could not read books from Firestore:", error);
      return [];
    }
  },
  ["journal-books"],
  { revalidate: 300, tags: ["books"] }
);
