import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true
  },
  images: {
    domains: ['images.unsplash.com']
  }
};

export default nextConfig;
