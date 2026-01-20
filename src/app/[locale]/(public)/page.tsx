import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { HeroSection } from '@/components/public/hero-section';
import { PartnersSection } from '@/components/public/partners-section';
import { BelowFoldSections } from '@/components/public/below-fold-sections';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/', locale as Locale);
}

// Revalidate ogni ora per ISR
export const revalidate = 3600;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Above-the-fold - caricati immediatamente */}
      <HeroSection />
      <PartnersSection />

      {/* Below-the-fold - lazy loaded per migliorare TTI */}
      <BelowFoldSections />
    </>
  );
}
