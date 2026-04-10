/** @type {import('next').NextConfig} */
// Determine API URL for server-side proxying
// Priority: API_INTERNAL_URL > derived from NEXT_PUBLIC_API_URL > localhost fallback
let apiInternalUrl = process.env.API_INTERNAL_URL;

// If API_INTERNAL_URL not set, try to derive from NEXT_PUBLIC_API_URL
if (!apiInternalUrl && process.env.NEXT_PUBLIC_API_URL) {
  apiInternalUrl = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
}

// Validate URL format (must start with http:// or https://)
if (apiInternalUrl && !apiInternalUrl.match(/^https?:\/\//)) {
  console.warn(`⚠ Warning: API_INTERNAL_URL is malformed: ${apiInternalUrl}`);
  apiInternalUrl = null;
}

// Use localhost as final fallback
if (!apiInternalUrl) {
  apiInternalUrl = 'http://localhost:5000';
}

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
    // Only use external rewrites if API_INTERNAL_URL is a full URL (not localhost in production)
    const isExternalAPI = apiInternalUrl &&
                          apiInternalUrl !== 'http://localhost:5000' &&
                          apiInternalUrl.match(/^https?:\/\//);

    if (isExternalAPI) {
      // For Railway: rewrite to external API service
      return {
        fallback: [
          {
            source: '/api/:path*',
            destination: `${apiInternalUrl}/api/:path*`,
          },
        ],
      };
    } else {
      // For local dev or when API_INTERNAL_URL not set: use relative rewrites
      // (Next.js will pass through to the same origin)
      return {
        fallback: [],
      };
    }
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
