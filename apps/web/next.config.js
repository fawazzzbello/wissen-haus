/** @type {import('next').NextConfig} */
const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Frontend always calls /api/* (proxied by Next.js rewrites)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiInternalUrl}/api/:path*`,
        },
      ],
    };
  },
  async redirects() {
    return [];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    return config;
  },
};

module.exports = nextConfig;
