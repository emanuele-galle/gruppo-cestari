import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { SocietaClient } from './SocietaClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/societa', locale as Locale);
}

export default async function SocietaPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SocietaClient />;
}
