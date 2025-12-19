// next.config.ts
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,

  // ✅ Cloudflare Pages Edge runtime (required)
  experimental: {
    functions: {
      'app/api/sync/route.ts': {
        runtime: 'edge',  // Required for Cloudflare Pages
      },
    },
    serverActions: {},
  },

  // ✅ Cloudflare Pages optimized
  output: 'export',
  trailingSlash: true,
};

export default withBundleAnalyzer(nextConfig);
