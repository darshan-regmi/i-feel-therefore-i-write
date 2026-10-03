import type { MetadataRoute } from "next";
import { getPoemsFromNotion } from "@/lib/notion";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/poem`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about-the-author`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    // Hardcoded in app/poem/doorway, not in Notion, so getPoemsFromNotion()
    // never returns it — without this it was an indexable page absent from the
    // sitemap.
    {
      url: `${SITE_URL}/poem/doorway`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  let poemRoutes: MetadataRoute.Sitemap = [];
  try {
    const poems = await getPoemsFromNotion();
    poemRoutes = poems.map((p) => ({
      url: `${SITE_URL}/poem/${p.id}`,
      // Notion's last_edited_time is an ISO string, but a malformed or absent
      // value would produce an Invalid Date and serialize as "Invalid Date",
      // which makes the whole sitemap unparseable. Fall back to now.
      lastModified: parseDate(p.updatedAt) ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("sitemap: failed to fetch poems from Notion", error);
  }

  return [...staticRoutes, ...poemRoutes];
}

/** Returns null rather than an Invalid Date for missing/garbage input. */
function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
