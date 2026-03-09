import { Metadata } from 'next';
import { db } from '@/lib/db';
import { type Locale } from '@/i18n/routing';
import { generateArticleMetadata } from '@/lib/seo';
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/structured-data';
import NewsDetailClient from './NewsDetailClient';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getNewsBySlug(slug: string, locale: string) {
  const news = await db.news.findFirst({
    where: { slug, isPublished: true },
    include: {
      translations: true,
      category: { include: { translations: true } },
    },
  });
  if (!news) return null;

  const translation =
    news.translations.find((t) => t.locale === locale) ||
    news.translations.find((t) => t.locale === 'it') ||
    news.translations[0];

  const categoryTranslation =
    news.category?.translations?.find((t) => t.locale === locale) ||
    news.category?.translations?.find((t) => t.locale === 'it') ||
    news.category?.translations?.[0];

  return { news, translation, categoryName: categoryTranslation?.name || 'News' };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getNewsBySlug(slug, locale);

  if (!data?.translation) {
    return { title: 'News | Gruppo Cestari' };
  }

  const { news, translation } = data;

  return generateArticleMetadata({
    title: translation.title,
    description: translation.excerpt || translation.title,
    slug: news.slug,
    locale: locale as Locale,
    image: news.featuredImage || undefined,
    publishedTime: news.publishedAt?.toISOString(),
    modifiedTime: news.updatedAt?.toISOString(),
    tags: news.translations
      .filter((t) => t.locale === locale)
      .map((t) => t.title),
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const data = await getNewsBySlug(slug, locale);

  return (
    <>
      {data?.translation && (
        <>
          <ArticleStructuredData
            title={data.translation.title}
            description={data.translation.excerpt || data.translation.title}
            image={data.news.featuredImage || '/og-image.jpg'}
            datePublished={data.news.publishedAt?.toISOString() || data.news.createdAt.toISOString()}
            dateModified={data.news.updatedAt?.toISOString()}
            slug={data.news.slug}
            locale={locale}
          />
          <BreadcrumbStructuredData
            items={[
              { name: 'Home', href: '/' },
              { name: 'News', href: '/news' },
              { name: data.translation.title, href: `/news/${slug}` },
            ]}
            locale={locale}
          />
        </>
      )}
      <NewsDetailClient params={params} />
    </>
  );
}
