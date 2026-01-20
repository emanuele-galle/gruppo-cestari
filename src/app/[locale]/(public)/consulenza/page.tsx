import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { ConsulenzaClient } from './ConsulenzaClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/consulenza', locale as Locale);
}

export default async function ConsulenzaPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ConsulenzaClient />;
}
