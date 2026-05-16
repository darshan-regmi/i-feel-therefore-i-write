if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SITE_URL. See .env.example."
  );
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
