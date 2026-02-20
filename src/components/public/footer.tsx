'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { MapPin, Phone, Mail, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const quickLinks = [
  { name: 'about', href: '/chi-siamo' },
  { name: 'services', href: '/servizi' },
  { name: 'companies', href: '/societa' },
  { name: 'news', href: '/news' },
  { name: 'contact', href: '/contatti' },
];

const serviceKeys = ['financial', 'cooperation', 'energy', 'planning'];

const socialLinks = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/gruppo-cestari-599423266/', icon: Linkedin },
  { name: 'Facebook', href: 'https://www.facebook.com/cestarigroup/?locale=it_IT', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/cestari.group/', icon: Instagram },
  { name: 'YouTube', href: 'https://www.youtube.com/@CestariGroup', icon: Youtube },
  { name: 'X', href: 'https://x.com/CestariGruppo', icon: XIcon },
];

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 pb-safe">
        {/* Main footer content - grid responsive migliorato */}
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Company info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-10 w-36">
                <Image
                  src="/images/logo-gruppo.webp"
                  alt="Gruppo Cestari"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed max-w-sm">
              {t('about')}
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/10 active:scale-95 transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-100 text-sm uppercase tracking-wider mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block py-2 text-sm text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
                  >
                    {tNav(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-slate-100 text-sm uppercase tracking-wider mb-4">
              {t('services')}
            </h3>
            <ul className="space-y-1">
              {serviceKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={`/servizi#${key}`}
                    className="inline-block py-2 text-sm text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
                  >
                    {tServices(`${key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-slate-100 text-sm uppercase tracking-wider mb-4">
              {t('contact')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+39089952889"
                  className="inline-flex items-center gap-2 py-2 text-sm text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +39 089 952889
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@gruppocestari.com"
                  className="inline-flex items-center gap-2 py-2 text-sm text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  info@gruppocestari.com
                </a>
              </li>
              <li className="flex items-start gap-2 py-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span>{t('locations.fisciano')}</span>
                  <span>{t('locations.napoli')}</span>
                  <span>{t('locations.milano')}</span>
                  <span>{t('locations.roma')}</span>
                  <span>{t('locations.moliterno')}</span>
                  <span>{t('locations.bruxelles')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-700">
          <div className="flex flex-col gap-6">
            {/* Links row - centered on mobile */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                href="/privacy"
                className="py-2 text-xs text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
              >
                {t('legal.privacy')}
              </Link>
              <Link
                href="/cookie"
                className="py-2 text-xs text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
              >
                {t('legal.cookies')}
              </Link>
              <Link
                href="/termini"
                className="py-2 text-xs text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
              >
                {t('legal.terms')}
              </Link>
              <Link
                href="/admin"
                className="py-2 text-xs text-slate-400 hover:text-primary active:text-primary/80 transition-colors"
              >
                Area Riservata
              </Link>
            </div>
            {/* Copyright and credits */}
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-400">
                {t('copyright', { year: currentYear })}
              </p>
              <p
                dangerouslySetInnerHTML={{ __html: t.raw('credits') }}
                className="text-xs text-slate-400 [&_a]:text-slate-300 [&_a]:hover:text-primary [&_a]:transition-colors"
              />
              <p className="text-xs text-slate-400">
                {t('owner')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
