const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!configuredSiteUrl) {
  console.warn(
    "NEXT_PUBLIC_SITE_URL is not set; falling back to the production URL. See .env.example."
  );
}

// Fall back instead of throwing at module scope: a preview build without the
// variable should still deploy, and its canonical URLs should never point at
// localhost or an empty host. Production sets the real value.
export const SITE_URL = (
  configuredSiteUrl || "https://poetry.darshanregmi.com.np"
).replace(/\/$/, "");

/** The themed, dynamically rendered social card. */
export const OG_IMAGE = `${SITE_URL}/opengraph-image`;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
