import type { MetadataRoute } from 'next';
import { getSite, SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  return (site.pages || [])
    .filter((p: any) => p.isVisible !== false)
    .map((p: any) => ({ url: `${SITE_URL}${p.slug === '/' ? '' : p.slug}`, changeFrequency: 'weekly' as const, priority: p.slug === '/' ? 1 : 0.4 }));
}
