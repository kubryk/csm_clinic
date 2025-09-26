import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
  // Configure for large file uploads
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
  // Increase timeout for large file uploads
  serverRuntimeConfig: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
  // Configure request size limit
  serverComponentsExternalPackages: [],
};

export default nextConfig;
