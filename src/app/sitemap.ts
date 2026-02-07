import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gruppocestari.com';
const locales = ['it', 'en', 'fr'];

// Static pages
const staticPages = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/chi-siamo', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/servizi', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/societa', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/sostenibilita', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/progetti', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/bandi', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/contatti', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/consulenza', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/cookie', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Add static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  try {
    // Add dynamic news pages
    const news = await db.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });

    for (const item of news) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/news/${item.slug}`,
          lastModified: item.updatedAt || item.publishedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    // Add dynamic bandi pages
    const bandi = await db.bando.findMany({
      where: { isPublished: true },
      orderBy: { closeDate: 'desc' },
    });

    for (const item of bandi) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/bandi/${item.code}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return entries;
}
