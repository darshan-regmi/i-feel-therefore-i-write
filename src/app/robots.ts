import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Replaces the static public/robots.txt, which hardcoded
 * https://poetry.darshanregmi.com.np while the rest of the app reads SITE_URL
 * — the two drifted apart whenever the domain changed. An app/robots.ts route
 * also takes precedence over a same-named file in public/, so leaving the static
 * copy in place would have shadowed this one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /login and /liked-poem are also marked noindex in their own metadata;
        // disallow here just keeps crawl budget off them.
        disallow: ["/api/", "/login", "/liked-poem", "/qwzx"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}