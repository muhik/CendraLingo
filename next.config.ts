import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack warning when using custom webpack config
  turbopack: {},

  // Exclude better-sqlite3 from bundling (Node only)
  serverExternalPackages: ["better-sqlite3"],

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
};

export default nextConfig;
