'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const partners = [
  {
    id: 1,
    name: 'Commissione Europea',
    logo: '/images/partners/european-commission.svg',
    url: 'https://commission.europa.eu/index_it',
  },
  {
    id: 2,
    name: 'AICS',
    logo: '/images/partners/aics.webp',
    url: 'https://www.aics.gov.it/',
  },
  {
    id: 3,
    name: 'Invitalia',
    logo: '/images/partners/invitalia.webp',
    url: 'https://www.invitalia.it/',
  },
  {
    id: 4,
    name: 'Regione Campania',
    logo: '/images/partners/regione-campania.svg',
    url: 'https://www.regione.campania.it/',
  },
  {
    id: 5,
    name: 'MIMIT',
    logo: '/images/partners/mimit.webp',
    url: 'https://www.mimit.gov.it/',
  },
  {
    id: 6,
    name: 'Confindustria',
    logo: '/images/partners/confindustria.svg',
    url: 'https://www.confindustria.it/',
  },
  {
    id: 7,
    name: 'Unioncamere',
    logo: '/images/partners/unioncamere.webp',
    url: 'https://www.unioncamere.gov.it/',
  },
  {
    id: 8,
    name: 'GSE',
    logo: '/images/partners/gse.webp',
    url: 'https://www.gse.it/',
  },
];

export function PartnersSection() {
  const t = useTranslations('home.partners');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Faster scroll on mobile (6s vs 30s on desktop)
  const scrollDuration = isMobile ? 6 : 30;

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden min-h-[180px]">
      <style jsx>{`
        @keyframes scroll-partners {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scroll-animation {
          animation: scroll-partners ${scrollDuration}s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header - no initial animation for SSR visibility */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            {t('badge')}
          </span>
        </div>
      </div>

      {/* Scrolling Partners */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        {/* Scrolling container - CSS animation instead of framer-motion */}
        <div className="scroll-animation flex items-center gap-12">
          {/* Duplicate for seamless loop */}
          {[...partners, ...partners].map((partner, index) => (
            <Link
              key={`${partner.id}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group"
            >
              <div className="flex items-center justify-center h-20 px-6 bg-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-14 w-32">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                    sizes="(max-width: 768px) 80px, 128px"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
