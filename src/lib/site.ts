if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SITE_URL. See .env.example."
  );
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

/** The themed, dynamically rendered social card. */
export const OG_IMAGE = `${SITE_URL}/opengraph-image`;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
