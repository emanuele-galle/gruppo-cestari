import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { NewsClient } from './NewsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/news', locale as Locale);
}

const H1_TEXT: Record<string, string> = {
  it: 'News e Aggiornamenti su Bandi, Finanziamenti e Cooperazione Internazionale',
  en: 'News and Updates on Grants, Funding and International Cooperation',
  fr: 'Actualités et Mises à Jour sur les Subventions et la Coopération Internationale',
};

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <h1 className="sr-only">{H1_TEXT[locale] || H1_TEXT.it}</h1>
      <NewsClient />
    </>
  );
}
