import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aatcc.vercel.app';

  // Add your static routes here
  const staticRoutes = [
    '/',
    '/about',
    '/events',
    '/contact',
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}