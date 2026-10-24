import type { MetadataRoute } from 'next';
import { GUEST, getCategories } from '@/lib/data';
import { SITE_URL } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // نُدرج فقط الفئات الجاهزة للعب، كي لا تُفهرس صفحات فارغة
  const cats = (await getCategories(GUEST)).filter((c) => c.playable && !c.premium);
  const pages = ['', '/categories', '/pricing', '/sponsors', '/business', '/privacy', '/terms', '/cookies', '/refund'];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 })),
    ...cats.map((c) => ({ url: `${SITE_URL}/categories/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
