import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { getStaticPageMetadata } from '@/lib/seo';
import { type Locale } from '@/i18n/routing';
import { FAQStructuredData, BreadcrumbStructuredData } from '@/components/structured-data';
import { FaqClient } from './FaqClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getStaticPageMetadata('/faq', locale as Locale);
}

// Static FAQ data for structured data (matches translation keys)
function getFaqItems(messages: Record<string, unknown>) {
  const faq = messages.faq as Record<string, Record<string, Record<string, string>>>;
  if (!faq?.items) return [];

  return Object.values(faq.items).map((item) => ({
    question: item.question,
    answer: item.answer,
  }));
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const faqItems = getFaqItems(messages as Record<string, unknown>);

  return (
    <>
      {faqItems.length > 0 && <FAQStructuredData items={faqItems} />}
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', href: '/' },
          { name: 'FAQ', href: '/faq' },
        ]}
        locale={locale}
      />
      <FaqClient />
    </>
  );
}
