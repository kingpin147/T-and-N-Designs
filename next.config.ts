import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "media.tnndesigns.com",
      },
      {
        protocol: "https",
        hostname: "**.neon.tech",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/_api/mcp",
        destination: "/api/mcp",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/our-works",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/our-works-1",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/portfolio",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/estimator",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/cost-estimator",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
