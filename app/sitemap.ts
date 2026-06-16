import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-chat.engineer';

  // Core public routes to index
  const routes: MetadataRoute.Sitemap = ['', '/chat', '/help', '/privacy', '/terms'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: (route === '' || route === '/chat') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : (route === '/chat' ? 0.9 : 0.5),
  }));

  return routes;
}
