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
  },
};

export default nextConfig;
