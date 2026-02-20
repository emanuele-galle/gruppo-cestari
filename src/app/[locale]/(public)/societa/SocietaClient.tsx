'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Globe2, Leaf, Briefcase, ArrowRight, Filter, Handshake, Mail, Phone, Sparkles, Sun, Wind, Zap, TreeDeciduous, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Company = {
  id: string;
  slug: string;
  name: string;
  descriptionKey: string;
  sectorKey: string;
  logo: string;
  icon: typeof Briefcase;
  color: string;
};

const sectors = [
  { key: 'all', icon: Filter, color: 'from-slate-600 to-slate-700', bg: 'bg-slate-100' },
  { key: 'energy', icon: Leaf, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { key: 'consulting', icon: Briefcase, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { key: 'international', icon: Globe2, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
];

const sectorColors: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  'sectors.energy': { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  'sectors.consulting': { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'sectors.international': { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
};

export function SocietaClient() {
  const t = useTranslations('companies');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [selectedSector, setSelectedSector] = useState('all');

  const companies: Company[] = [
    {
      id: 'strategic-energy',
      slug: 'strategic-energy',
      name: 'Strategic Energy Resources',
      descriptionKey: 'list.strategicEnergy.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/strategic-energy.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'cestari-brasil',
      slug: 'cestari-brasil',
      name: 'Cestari Brasil',
      descriptionKey: 'list.cestariBrasil.description',
      sectorKey: 'sectors.international',
      logo: '/images/companies/cestari-brasil.webp',
      icon: Globe2,
      color: 'international',
    },
    {
      id: 'newser1',
      slug: 'newser1',
      name: 'Newser1',
      descriptionKey: 'list.newser1.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/newser1.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'futuro-programmazione',
      slug: 'futuro-programmazione',
      name: 'Futuro & Programmazione',
      descriptionKey: 'list.futuroProgrammazione.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/futuro-programmazione.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'ristruttura',
      slug: 'ristruttura',
      name: 'Ristruttura SMC Newco',
      descriptionKey: 'list.ristruttura.description',
      sectorKey: 'sectors.consulting',
      logo: '/images/companies/ristruttura.webp',
      icon: Building2,
      color: 'consulting',
    },
    {
      id: 'sakti',
      slug: 'sakti',
      name: 'SAKTI',
      descriptionKey: 'list.sakti.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/sakti.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'wiremena',
      slug: 'wiremena',
      name: 'Wiremena',
      descriptionKey: 'list.wiremena.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/wiremena.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'italafrica',
      slug: 'italafrica',
      name: 'ItalAfrica Centrale',
      descriptionKey: 'list.italAfrica.description',
      sectorKey: 'sectors.international',
      logo: '/images/companies/italafrica.webp',
      icon: Globe2,
      color: 'international',
    },
    {
      id: 'cestari-france',
      slug: 'cestari-france',
      name: 'Cestari Group France',
      descriptionKey: 'list.cestariFrance.description',
      sectorKey: 'sectors.international',
      logo: '/images/companies/cestari-france.webp',
      icon: Globe2,
      color: 'international',
    },
    {
      id: 'midday-sun',
      slug: 'midday-sun',
      name: 'Midday Sun',
      descriptionKey: 'list.middaySun.description',
      sectorKey: 'sectors.energy',
      logo: '/images/companies/midday-sun.webp',
      icon: Leaf,
      color: 'energy',
    },
    {
      id: 'flywin',
      slug: 'flywin',
      name: 'Flywin S.p.A.',
      descriptionKey: 'list.flywin.description',
      sectorKey: 'sectors.consulting',
      logo: '/images/companies/flywin.webp',
      icon: Briefcase,
      color: 'consulting',
    },
  ];

  const filteredCompanies = useMemo(() => {
    if (selectedSector === 'all') return companies;
    return companies.filter((company) => company.sectorKey === `sectors.${selectedSector}`);
  }, [selectedSector, companies]);

  // Count companies per sector
  const sectorCounts = useMemo(() => {
    return sectors.reduce((acc, sector) => {
      if (sector.key === 'all') {
        acc[sector.key] = companies.length;
      } else {
        acc[sector.key] = companies.filter(c => c.sectorKey === `sectors.${sector.key}`).length;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [companies]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero with African-inspired gradient background */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background gradient - African inspired: terracotta, amber, warm earth tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-stone-900" />

        {/* Animated background shapes - warm African colors */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/25 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 -left-20 w-80 h-80 bg-orange-600/30 rounded-full blur-[80px]"
            animate={{ scale: [1.2, 1, 1.2], x: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-600/15 rounded-full blur-[120px]"
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/4 left-1/3 w-64 h-64 bg-red-700/20 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* African pattern overlay - geometric */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="africanPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="30" cy="30" r="8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#africanPattern)" />
          </svg>
        </div>

        {/* Floating sector icons - distinctive animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Africa/International - Globe */}
          <motion.div
            className="absolute top-[15%] left-[8%]"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Globe2 className="w-16 h-16 text-amber-300" />
          </motion.div>

          {/* Energy - Sun */}
          <motion.div
            className="absolute top-[20%] right-[12%]"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          >
            <Sun className="w-20 h-20 text-yellow-400" />
          </motion.div>

          {/* Energy - Wind turbine */}
          <motion.div
            className="absolute bottom-[25%] left-[15%]"
            animate={{
              rotate: [0, 360],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Wind className="w-14 h-14 text-emerald-400" />
          </motion.div>

          {/* Africa - Acacia tree (using TreeDeciduous) */}
          <motion.div
            className="absolute bottom-[20%] right-[8%]"
            animate={{
              y: [0, -8, 0],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <TreeDeciduous className="w-16 h-16 text-orange-300" />
          </motion.div>

          {/* Energy - Lightning bolt */}
          <motion.div
            className="absolute top-[45%] left-[5%]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.35, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="w-10 h-10 text-yellow-300" />
          </motion.div>

          {/* Energy - Leaf */}
          <motion.div
            className="absolute bottom-[35%] left-[25%]"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 15, -15, 0],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Leaf className="w-12 h-12 text-emerald-300" />
          </motion.div>

          {/* Consulting - Briefcase */}
          <motion.div
            className="absolute top-[60%] right-[15%]"
            animate={{
              y: [0, -10, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <Briefcase className="w-10 h-10 text-blue-300" />
          </motion.div>
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200 text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto px-2"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-12"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">11</div>
                <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider">Società</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">3</div>
                <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider">Settori</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">40+</div>
                <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider">Anni di esperienza</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave decoration with warm gradient */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
            </defs>
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Sector Filter */}
      <section className="py-4 sm:py-6 bg-white border-b border-slate-100 sticky top-[64px] sm:top-[72px] z-30 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              const isActive = selectedSector === sector.key;
              const count = sectorCounts[sector.key];
              return (
                <motion.button
                  key={sector.key}
                  onClick={() => setSelectedSector(sector.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 touch-target ${
                    isActive
                      ? `bg-gradient-to-r ${sector.color} text-white shadow-lg shadow-primary/20`
                      : `${sector.bg} text-slate-700 hover:shadow-md`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{sector.key === 'all' ? 'Tutti' : t(`sectors.${sector.key}`)}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section ref={ref} className="py-10 sm:py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSector}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8"
            >
              {filteredCompanies.map((company, index) => {
                const Icon = company.icon;
                const colors = sectorColors[company.sectorKey] || sectorColors['sectors.energy'];
                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                  >
                    <Link
                      href={`/societa/${company.slug}`}
                      className="group block h-full"
                    >
                      <div className={`relative h-full bg-white rounded-2xl border ${colors.border} overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2`}>
                        {/* Gradient top bar */}
                        <div className={`h-1.5 bg-gradient-to-r ${colors.gradient}`} />

                        {/* Content */}
                        <div className="p-3 sm:p-5 lg:p-8">
                          {/* Logo container - neutral background for better logo visibility */}
                          <div className="relative w-full h-14 sm:h-16 lg:h-20 mb-4 sm:mb-5 lg:mb-6 bg-white rounded-xl p-3 sm:p-4 transition-transform duration-300 group-hover:scale-105 border border-slate-100">
                            <Image
                              src={company.logo}
                              alt={company.name}
                              fill
                              className="object-contain"
                            />
                          </div>

                          {/* Sector badge */}
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.text}`} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                              {t(company.sectorKey)}
                            </span>
                          </div>

                          {/* Name */}
                          <h2 className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                            {company.name}
                          </h2>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                            {t(company.descriptionKey)}
                          </p>

                          {/* CTA */}
                          <div className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold ${colors.text} group-hover:gap-3 transition-all`}>
                            <span className="hidden sm:inline">Scopri di più</span>
                            <span className="sm:hidden">Dettagli</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>

                        {/* Hover overlay effect */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {filteredCompanies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nessuna società trovata</h3>
              <p className="text-slate-500">Prova a selezionare un altro settore</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-28 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4 sm:mb-6">
                <Handshake className="w-4 h-4" />
                <span className="hidden xs:inline">Partnership & Collaborazioni</span>
                <span className="xs:hidden">Partnership</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Vuoi entrare a far parte del{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-emerald-400">
                  nostro network?
                </span>
              </h2>

              <p className="text-base sm:text-lg text-white/70 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
                Siamo sempre alla ricerca di nuove partnership e collaborazioni strategiche.
                Contattaci per esplorare insieme le opportunità di crescita.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/contatti"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto touch-target"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Contattaci
                </Link>
                <a
                  href="tel:+39089952889"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all w-full sm:w-auto touch-target"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  +39 089 952889
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
