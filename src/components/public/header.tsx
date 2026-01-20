'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { Menu, X, ChevronDown, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/chi-siamo' },
  { name: 'services', href: '/servizi' },
  { name: 'companies', href: '/societa' },
  { name: 'sustainability', href: '/sostenibilita' },
  { name: 'projects', href: '/progetti' },
  { name: 'news', href: '/news' },
  { name: 'grants', href: '/bandi' },
  { name: 'contact', href: '/contatti' },
];

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params.locale as Locale) || 'it';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setLangMenuOpen(false);
    if (langMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [langMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-lg shadow-black/5 border-b border-slate-100'
          : 'bg-white/95 backdrop-blur-xl border-b border-slate-100/50'
      )}
    >
      <nav className="container mx-auto flex h-20 lg:h-24 items-center justify-between px-4 lg:px-8">
        {/* Logo - responsive per tutti i breakpoint */}
        <Link href="/" className="relative z-10 flex items-center group">
          <div className="relative h-10 w-32 xs:h-11 xs:w-36 sm:h-12 sm:w-40 lg:h-14 lg:w-48 transition-all duration-300">
            <Image
              src="/images/logo-gruppo.webp"
              alt="Gruppo Cestari"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-0.5 xl:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium transition-all rounded-lg whitespace-nowrap',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              )}
            >
              {t(item.name)}
              {pathname === item.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangMenuOpen(!langMenuOpen);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all text-slate-600 hover:bg-slate-50"
            >
              <Globe className="h-4 w-4" />
              <span>{currentLocale.toUpperCase()}</span>
              <ChevronDown
                className={cn('h-3 w-3 transition-transform duration-200', langMenuOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-100 bg-white shadow-xl shadow-black/10 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {locales.map((locale) => (
                    <Link
                      key={locale}
                      href={pathname}
                      locale={locale}
                      onClick={() => setLangMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                        locale === currentLocale
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className="w-6 text-center text-base">
                        {locale === 'it' ? '🇮🇹' : locale === 'en' ? '🇬🇧' : '🇫🇷'}
                      </span>
                      {localeNames[locale]}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Button */}
          <Link
            href="/area-riservata"
            className="group inline-flex items-center gap-2 px-4 xl:px-6 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 whitespace-nowrap"
          >
            {t('portal')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile menu button - touch target 44px minimo */}
        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          className="lg:hidden relative z-10 inline-flex items-center justify-center rounded-xl p-3 min-w-[44px] min-h-[44px] transition-colors text-slate-600 hover:bg-slate-100 active:bg-slate-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={false}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu - con safe area per notch/Dynamic Island */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            id="mobile-menu"
            className="lg:hidden bg-white border-t overflow-hidden overflow-y-auto"
            style={{ maxHeight: 'calc(100svh - 80px - env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="container mx-auto px-4 py-6 pb-safe">
              <div className="space-y-1">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-4 min-h-[48px] text-base font-medium transition-colors active:bg-slate-100',
                        pathname === item.href
                          ? 'bg-primary/5 text-primary'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {t(item.name)}
                      {pathname === item.href && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-t border-slate-100 mt-6 pt-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">{localeNames[currentLocale]}</span>
                  <div className="flex gap-2 ml-auto">
                    {locales.map((locale) => (
                      <Link
                        key={locale}
                        href={pathname}
                        locale={locale}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'px-4 py-2.5 min-h-[44px] min-w-[44px] text-sm rounded-lg font-medium transition-all flex items-center justify-center active:scale-95',
                          locale === currentLocale
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {locale.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/area-riservata"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-4 min-h-[52px] text-base font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  {t('portal')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
