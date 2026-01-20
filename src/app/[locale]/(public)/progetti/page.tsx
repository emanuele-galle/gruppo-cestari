import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { ProgettiClient } from './ProgettiClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/progetti', locale as Locale);
}

export default async function ProgettiPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProgettiClient />;
}
