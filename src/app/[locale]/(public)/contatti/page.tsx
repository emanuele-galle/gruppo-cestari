import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { ContattiClient } from './ContattiClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/contatti', locale as Locale);
}

export default async function ContattiPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContattiClient />;
}
