import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { BandiClient } from './BandiClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/bandi', locale as Locale);
}

const H1_TEXT: Record<string, string> = {
  it: 'Bandi e Agevolazioni per Imprese, Enti Pubblici e PMI',
  en: 'Grants and Incentives for Businesses, Public Entities and SMEs',
  fr: 'Appels d\'Offres et Subventions pour Entreprises et PME',
};

export default async function BandiPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <h1 className="sr-only">{H1_TEXT[locale] || H1_TEXT.it}</h1>
      <BandiClient />
    </>
  );
}
