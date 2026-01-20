'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Zap,
  Globe,
  TrendingUp,
  Leaf,
  Users,
} from 'lucide-react';

// Progetti VERIFICATI - Solo progetti reali con riscontri online
const projects = [
  {
    id: '1',
    slug: 'sud-polo-magnetico',
    titleKey: 'sudpolo.title',
    excerptKey: 'sudpolo.excerpt',
    sector: 'financial',
    location: 'Mezzogiorno',
    year: 2024,
    impactKey: 'sudpolo.impact',
    image: '/images/progetti/sud-polo-magnetico.jpg',
    featured: true,
  },
  {
    id: '2',
    slug: 'cer-moliterno-energia-dal-sole',
    titleKey: 'cer.title',
    excerptKey: 'cer.excerpt',
    sector: 'energy',
    location: 'Moliterno, Basilicata',
    year: 2024,
    impactKey: 'cer.impact',
    image: '/images/progetti/energia-solare.jpg',
  },
  {
    id: '3',
    slug: 'missione-congo',
    titleKey: 'congo.title',
    excerptKey: 'congo.excerpt',
    sector: 'cooperation',
    location: 'Rep. Dem. Congo',
    year: 2025,
    impactKey: 'congo.impact',
    image: '/images/progetti/congo/congo-01.jpg',
  },
  {
    id: '4',
    slug: 'cop30-clima',
    titleKey: 'cop30.title',
    excerptKey: 'cop30.excerpt',
    sector: 'cooperation',
    location: 'Internazionale',
    year: 2025,
    impactKey: 'cop30.impact',
    image: '/images/progetti/cop30/cop30-01.jpg',
  },
  {
    id: '5',
    slug: 'cooperazione-italafrica',
    titleKey: 'italafrica.title',
    excerptKey: 'italafrica.excerpt',
    sector: 'cooperation',
    location: '19 Paesi Africani',
    year: 2024,
    impactKey: 'italafrica.impact',
    image: '/images/progetti/cooperazione-africa.jpg',
  },
];

const sectors = [
  { key: 'all', labelKey: 'filters.all', icon: null },
  { key: 'energy', labelKey: 'filters.energy', icon: Zap },
  { key: 'cooperation', labelKey: 'filters.cooperation', icon: Globe },
  { key: 'financial', labelKey: 'filters.financial', icon: TrendingUp },
  { key: 'training', labelKey: 'filters.training', icon: Users },
];

const sectorIcons: Record<string, typeof Zap> = {
  energy: Leaf,
  cooperation: Globe,
  financial: TrendingUp,
  training: Users,
};

export function ProjectsShowcaseSection() {
  const t = useTranslations('home.projects');
  const [activeFilter, setActiveFilter] = useState('all');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const filteredProjects =
    activeFilter === 'all'
      ? projects.slice(0, 6)
      : projects.filter((p) => p.sector === activeFilter);

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden"
    >

      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-secondary/10 blur-2xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {t('badge')}
            </span>
            <h2 className="text-4xl lg:text-5xl text-slate-800 mb-4">
              {t('title')}{' '}
              <span className="text-gradient">{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg text-slate-600">
              {t('subtitle')}
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <motion.button
                  key={sector.key}
                  onClick={() => setActiveFilter(sector.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === sector.key
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {t(sector.labelKey)}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredProjects.map((project, index) => {
              const SectorIcon = sectorIcons[project.sector] || Globe;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link href={`/progetti/${project.slug}`}>
                    <motion.article
                      whileHover={{ y: -8 }}
                      className="group relative h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
                    >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <Image
                          src={project.image}
                          alt={t(project.titleKey)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Year badge */}
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-primary shadow-lg">
                            {project.year}
                          </span>
                        </div>

                        {/* Impact badge */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/90 text-white text-sm font-medium shadow-lg"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {t(project.impactKey)}
                          </motion.span>
                        </div>
                      </div>

                      {/* Colored line */}
                      <div className="h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                      {/* Content */}
                      <div className="p-6">
                        {/* Location & Sector */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <SectorIcon className="w-3.5 h-3.5" />
                            {t(`filters.${project.sector}`)}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {t(project.titleKey)}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {t(project.excerptKey)}
                        </p>

                        {/* Read more */}
                        <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          {t('readMore')}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 lg:mt-16"
        >
          <Link
            href="/progetti"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            {t('viewAll')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
