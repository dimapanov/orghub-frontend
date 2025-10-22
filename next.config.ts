import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during migration
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors during migration
  },
};

export default nextConfig;
