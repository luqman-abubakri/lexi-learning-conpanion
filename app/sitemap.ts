import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lexi-ai.vercel.app';

  return [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/companions`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/my-journey`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/subscription`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}

