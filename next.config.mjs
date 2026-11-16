// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {},
  },
  async redirects() {
    return [
      // The journal's canonical list lives at /entries now.
      { source: "/poem", destination: "/entries", permanent: true },
      { source: "/about-the-author", destination: "/about", permanent: true },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)