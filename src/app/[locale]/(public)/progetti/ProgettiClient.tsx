'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Filter,
  Globe,
  Leaf,
  TrendingUp,
  Building2,
  Zap,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

// Mapping sector enum DB -> UI
const SECTOR_DB_TO_UI: Record<string, string> = {
  'FINANCE': 'financial',
  'COOPERATION': 'cooperation',
  'RENEWABLE_ENERGY': 'energy',
  'DEVELOPMENT': 'development',
  'REAL_ESTATE': 'realestate',
  'OTHER': 'other',
};

const SECTOR_UI_TO_DB: Record<string, string> = {
  'financial': 'FINANCE',
  'cooperation': 'COOPERATION',
  'energy': 'RENEWABLE_ENERGY',
  'development': 'DEVELOPMENT',
  'realestate': 'REAL_ESTATE',
  'other': 'OTHER',
};

const sectors = [
  { key: 'all', icon: null },
  { key: 'energy', icon: Zap },
  { key: 'financial', icon: TrendingUp },
  { key: 'cooperation', icon: Globe },
  { key: 'development', icon: Lightbulb },
  { key: 'realestate', icon: Building2 },
];

const SECTOR_LABELS: Record<string, string> = {
  'energy': 'Energia',
  'financial': 'Finanza',
  'cooperation': 'Cooperazione',
  'development': 'Sviluppo',
  'realestate': 'Immobiliare',
  'other': 'Altro',
};

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'IT': 'Italia',
  'FR': 'Francia',
  'DE': 'Germania',
  'ES': 'Spagna',
  'GB': 'Regno Unito',
  'BE': 'Belgio',
  'CH': 'Svizzera',
  'CD': 'Rep. Dem. Congo',
  'CG': 'Congo Brazzaville',
  'ET': 'Etiopia',
  'KE': 'Kenya',
  'TZ': 'Tanzania',
  'SN': 'Senegal',
  'GH': 'Ghana',
  'NG': 'Nigeria',
  'ZA': 'Sud Africa',
  'MA': 'Marocco',
  'EG': 'Egitto',
  'BR': 'Brasile',
  'XX': 'Internazionale',
  'XM': 'Multi-paese',
};

export function ProgettiClient() {
  const t = useTranslations('projects');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const [activeSector, setActiveSector] = useState('all');

  // Query projects from database
  const { data, isLoading, error } = trpc.projects.listPublic.useQuery({
    page: 1,
    limit: 50,
    sector: activeSector === 'all' ? undefined : SECTOR_UI_TO_DB[activeSector] as 'FINANCE' | 'COOPERATION' | 'RENEWABLE_ENERGY' | 'DEVELOPMENT' | 'OTHER',
    locale,
  });

  // Map DB projects to UI format
  const projects = (data?.items || []).map(project => {
    const translation = project.translations[0];
    return {
      id: project.id,
      slug: project.slug,
      title: translation?.title || 'Senza titolo',
      description: translation?.description || '',
      subtitle: translation?.subtitle || '',
      sector: SECTOR_DB_TO_UI[project.sector] || 'other',
      location: COUNTRY_NAMES[project.country] || project.country,
      year: project.startDate ? new Date(project.startDate).getFullYear() : new Date().getFullYear(),
      image: project.featuredImage || '/images/placeholder-project.jpg',
      featured: project.isFeatured,
    };
  });

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, typeof TrendingUp> = {
      financial: TrendingUp,
      cooperation: Globe,
      energy: Zap,
      development: Lightbulb,
    };
    return icons[sector] || Building2;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradient - green/teal theme for sustainability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing orbs */}
          <motion.div
            className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-400/25 blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[150px]"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Hexagonal grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexGrid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <motion.rect
              width="200%"
              height="200%"
              fill="url(#hexGrid)"
              initial={{ x: 0, y: 0 }}
              animate={{ x: -112, y: -100 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </svg>

          {/* Animated connection lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(16,185,129,0)" />
                <stop offset="50%" stopColor="rgba(16,185,129,0.6)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            {/* Diagonal lines */}
            <motion.line
              x1="0" y1="100%" x2="50%" y2="0"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="100%" y1="0" x2="30%" y2="100%"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.line
              x1="60%" y1="0" x2="100%" y2="80%"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </svg>

          {/* Floating geometric shapes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            >
              {i % 3 === 0 ? (
                <div className="w-4 h-4 border border-emerald-400/40 rotate-45" />
              ) : i % 3 === 1 ? (
                <div className="w-3 h-3 bg-teal-400/30 rounded-full" />
              ) : (
                <svg width="16" height="14" viewBox="0 0 16 14" className="text-cyan-400/40">
                  <polygon points="8,0 16,14 0,14" fill="currentColor" />
                </svg>
              )}
            </motion.div>
          ))}

          {/* Energy pulse rings */}
          <div className="absolute top-1/4 right-1/4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 border border-emerald-400/30 rounded-full"
                style={{ top: -64, left: -64 }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 1.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-medium mb-6 border border-emerald-400/20"
            >
              <Leaf className="w-4 h-4" />
              Dal 1980 al servizio delle imprese e del territorio
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6"
            >
              I Nostri{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                Progetti
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto"
            >
              Scopri i progetti che abbiamo realizzato nel campo dell&apos;efficientamento energetico,
              della cooperazione internazionale e della consulenza finanziaria.
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-20 lg:top-24 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Sector Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-2 text-sm text-slate-600 mr-2">
                <Filter className="w-4 h-4" />
                Settore:
              </span>
              {sectors.map((sector) => {
                const sectorLabels: Record<string, string> = {
                  'all': 'Tutti',
                  'energy': 'Energia',
                  'financial': 'Finanza',
                  'cooperation': 'Cooperazione',
                  'development': 'Sviluppo',
                };
                return (
                  <button
                    key={sector.key}
                    onClick={() => setActiveSector(sector.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeSector === sector.key
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {sector.icon && <sector.icon className="w-4 h-4" />}
                    {sectorLabels[sector.key]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-600">Caricamento progetti...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-lg text-slate-600">Errore nel caricamento dei progetti</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg text-slate-600">Nessun progetto trovato con i filtri selezionati</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => {
                const Icon = getSectorIcon(project.sector);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/progetti/${project.slug}`}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group h-full flex flex-col">
                        {/* Image Area */}
                        <div className="h-48 relative">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {/* Featured Badge */}
                          {project.featured && (
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                In Evidenza
                              </span>
                            </div>
                          )}
                          {/* Year Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-primary">
                              {project.year}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          {/* Meta */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              {SECTOR_LABELS[project.sector] || project.sector}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {project.location}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
                            {project.subtitle || project.description.replace(/<[^>]*>/g, '').substring(0, 150)}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                            <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Scopri di più
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]"
            animate={{ x: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Hexagonal pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ctaHexGrid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaHexGrid)" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-medium mb-6 border border-emerald-400/20"
            >
              <Leaf className="w-4 h-4" />
              Consulenza gratuita
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hai un progetto da realizzare?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Contattaci per una consulenza gratuita. Il nostro team di esperti ti aiutera
              a trovare le migliori soluzioni di finanziamento per il tuo progetto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consulenza"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-900 font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
              >
                Richiedi Consulenza
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/contatti"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/10 transition-colors"
              >
                Contattaci
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
