import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
