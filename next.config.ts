import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  }
};

export default nextConfig;
