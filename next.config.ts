import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@hugeicons/react', '@hugeicons/core-free-icons'],
  },
  cacheComponents: true,
};

export default nextConfig;
