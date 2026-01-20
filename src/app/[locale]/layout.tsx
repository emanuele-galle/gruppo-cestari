import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { TRPCProvider } from '@/components/providers/trpc-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { OrganizationStructuredData } from '@/components/structured-data';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { GoogleAnalytics } from '@/components/google-analytics';
import { interFont } from '@/app/layout';
import dynamic from 'next/dynamic';

// Favicon e manifest - necessari nel layout che renderizza <html>
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

// Lazy load cookie consent for better initial bundle size
const CookieConsent = dynamic(
  () => import('@/components/cookie-consent').then((mod) => mod.CookieConsent)
);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect per performance */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        {/* Preconnect per Google Analytics (deferred) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Preload LCP image per performance */}
        <link
          rel="preload"
          as="image"
          href="/images/hero/desktop-thumb.webp"
          media="(min-width: 768px)"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero/mobile-thumb.webp"
          media="(max-width: 767px)"
        />
        <OrganizationStructuredData />
      </head>
      <body className={`${interFont.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
          Vai al contenuto principale
        </a>
        <ServiceWorkerRegistration />
        <ThemeProvider>
          <AuthProvider>
            <TRPCProvider>
              <NextIntlClientProvider messages={messages}>
                <div className="min-h-screen flex flex-col" id="main-content">
                  {children}
                </div>
                <Toaster richColors position="top-right" />
                <CookieConsent />
              </NextIntlClientProvider>
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
