import type { MetadataRoute } from "next";
import { getPoemsFromNotion } from "@/lib/notion";

export const revalidate = 3600; // refresh hourly

const SITE_URL = "https://poetry.darshanregmi.com.np";

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
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about-the-author`,
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
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("sitemap: failed to fetch poems from Notion", error);
  }

  return [...staticRoutes, ...poemRoutes];
}
