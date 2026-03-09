import { Metadata } from 'next';
import { db } from '@/lib/db';
import { type Locale } from '@/i18n/routing';
import { generateBandoMetadata } from '@/lib/seo';
import { BreadcrumbStructuredData } from '@/components/structured-data';
import BandoDetailClient from './BandoDetailClient';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getBandoByCode(code: string, locale: string) {
  const bando = await db.bando.findFirst({
    where: { code, isPublished: true },
    include: { translations: true },
  });
  if (!bando) return null;

  const translation =
    bando.translations.find((t) => t.locale === locale) ||
    bando.translations.find((t) => t.locale === 'it') ||
    bando.translations[0];

  return { bando, translation };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getBandoByCode(slug, locale);

  if (!data?.translation) {
    return { title: 'Bandi e Agevolazioni | Gruppo Cestari' };
  }

  return generateBandoMetadata({
    title: `${data.translation.title} | Bandi Gruppo Cestari`,
    description: data.translation.summary || data.translation.title,
    slug: data.bando.code,
    locale: locale as Locale,
  });
}

export default async function BandoDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const data = await getBandoByCode(slug, locale);

  return (
    <>
      {data?.translation && (
        <BreadcrumbStructuredData
          items={[
            { name: 'Home', href: '/' },
            { name: 'Bandi', href: '/bandi' },
            { name: data.translation.title, href: `/bandi/${slug}` },
          ]}
          locale={locale}
        />
      )}
      <BandoDetailClient params={params} />
    </>
  );
}
