import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OrganizationStructuredData } from '@/components/structured-data';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { GoogleAnalytics } from '@/components/google-analytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Gruppo Cestari - Consulenza Finanziaria e Cooperazione Internazionale',
    template: '%s | Gruppo Cestari',
  },
  verification: {
    google: 'pMey1aM5S84Qoq5-8xCKGQIx4XeABADbbd077fltqJg',
  },
  description:
    'Holding multisettoriale specializzata in consulenza finanziaria, cooperazione internazionale ed energie rinnovabili. Oltre 40 anni di esperienza.',
  keywords: [
    'consulenza finanziaria',
    'cooperazione internazionale',
    'energie rinnovabili',
    'bandi europei',
    'finanziamenti pubblici',
    'sviluppo sostenibile',
  ],
  authors: [{ name: 'Gruppo Cestari' }],
  creator: 'Gruppo Cestari',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gruppocestari.com'),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: ['en_US', 'fr_FR'],
    siteName: 'Gruppo Cestari',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gruppo Cestari - Consulenza Finanziaria e Cooperazione Internazionale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root layout is a passthrough - locale layout handles <html> with dynamic lang
  return children;
}

// Export font variable for locale layout
export const interFont = inter;
