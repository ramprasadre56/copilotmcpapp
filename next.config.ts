import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose server-side environment variables
  env: {
    MCP_SERVER_URL: process.env.MCP_SERVER_URL || "http://localhost:3100",
  },
  // Enable experimental features for better env handling
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

