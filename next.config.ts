import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'textiletoday.com.bd',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'textilefocus.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imglink.io',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp'], // Use WebP for better compression
    minimumCacheTTL: 31536000, // Cache images for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200], // Reduced device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller image sizes
  },
  // Redirect from Vercel domain to custom domain
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'aatcc.vercel.app',
          },
        ],
        destination: 'https://www.aatccaust.org/:path*',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply these headers to the homepage (/)
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            // public = cacheable by anyone
            // max-age=3600 = Cache in browser for 1 hour (3600 seconds)
            // must-revalidate = After 1 hour, check Vercel again
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
