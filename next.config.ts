import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove standalone for better Docker compatibility
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
};

export default nextConfig;
