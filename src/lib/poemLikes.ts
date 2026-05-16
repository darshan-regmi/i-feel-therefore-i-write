import { unstable_cache } from "next/cache";

// Server-only Firestore REST helper that returns a map of poemId → like count
// for every poem document. One batched call replaces the ~N client-side
// `getTotalLikes()` round-trips that the listing page used to issue.

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function fetchAllPoemLikes(): Promise<Record<string, number>> {
  if (!PROJECT_ID || !API_KEY) {
    console.warn("⚠️ Firebase env vars missing; skipping server like prefetch");
    return {};
  }

  const out: Record<string, number> = {};
  let pageToken: string | undefined;

  try {
    do {
      const url = new URL(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/poems`
      );
      url.searchParams.set("pageSize", "300");
      url.searchParams.set("key", API_KEY);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        next: { revalidate: 60, tags: ["poem-likes"] },
      });
      if (!res.ok) {
        console.warn(`Firestore likes fetch failed: ${res.status}`);
        break;
      }
      const data = (await res.json()) as {
        documents?: Array<{ name: string; fields?: { likes?: { integerValue?: string } } }>;
        nextPageToken?: string;
      };
      for (const doc of data.documents ?? []) {
        const id = doc.name.split("/").pop();
        if (!id) continue;
        out[id] = Number(doc.fields?.likes?.integerValue ?? 0);
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
  } catch (error) {
    console.error("Failed to prefetch poem likes:", error);
  }

  return out;
}

export const getAllPoemLikes = unstable_cache(
  fetchAllPoemLikes,
  ["all-poem-likes"],
  { revalidate: 60, tags: ["poem-likes"] }
);
