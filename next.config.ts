import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  // Ensure Prisma client is bundled correctly
  webpack: (config) => {
    config.externals.push('@prisma/client');
    return config;
  },
};

export default nextConfig;
