import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
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

const H1_TEXT: Record<string, string> = {
  it: 'Gruppo Cestari - Consulenza Finanziaria, Cooperazione Internazionale ed Energie Rinnovabili',
  en: 'Gruppo Cestari - Financial Consulting, International Cooperation and Renewable Energy',
  fr: 'Gruppo Cestari - Conseil Financier, Coopération Internationale et Énergies Renouvelables',
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* H1 SEO - visibile ai crawler, nascosto visivamente (sr-only) */}
      <h1 className="sr-only">{H1_TEXT[locale] || H1_TEXT.it}</h1>

      {/* Above-the-fold - caricati immediatamente */}
      <HeroSection />
      <PartnersSection />

      {/* Below-the-fold - lazy loaded per migliorare TTI */}
      <BelowFoldSections />
    </>
  );
}
