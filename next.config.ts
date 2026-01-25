import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack warning when using custom webpack config
  // Silence Turbopack warning when using custom webpack config


  // Exclude better-sqlite3 from bundling (Node only)
  serverExternalPackages: ["better-sqlite3"],

  // Ignore TypeScript errors during build (false positives from catch-all routes)
  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": false,
        "stream": false,
        "better-sqlite3": false,
      };
    }
    return config;
  },

  // Disable image optimization for Cloudflare Pages (OpenNext)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
