import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable scheduled functions (Vercel Cron) to hit API routes
    // See: https://vercel.com/docs/cron-jobs
  },
};

export default nextConfig;
