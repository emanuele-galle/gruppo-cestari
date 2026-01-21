'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Globe,
  Leaf,
  TrendingUp,
  Users,
  Building2,
  Zap,
  CheckCircle,
  Target,
  Award,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import { useLightbox } from '@/components/ui/lightbox';
import { parseGallery, galleryToLightboxImages } from '@/lib/types/gallery';

// Mapping sector enum DB -> UI
const SECTOR_DB_TO_UI: Record<string, string> = {
  'FINANCE': 'financial',
  'COOPERATION': 'cooperation',
  'RENEWABLE_ENERGY': 'energy',
  'DEVELOPMENT': 'development',
  'OTHER': 'other',
};

const SECTOR_LABELS: Record<string, string> = {
  'energy': 'Energia',
  'financial': 'Finanza',
  'cooperation': 'Cooperazione',
  'development': 'Sviluppo',
  'other': 'Altro',
};

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'IT': 'Italia',
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
  'INT': 'Internazionale',
  'MULTI': 'Multinazionale',
};

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const t = useTranslations('projects');

  // Fetch project data from database
  const { data: project, isLoading, error } = trpc.projects.getBySlug.useQuery({
    slug: resolvedParams.slug,
    locale,
  });

  // Fetch all projects for navigation
  const { data: allProjectsData } = trpc.projects.listPublic.useQuery({
    page: 1,
    limit: 100,
    locale,
  });

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, typeof TrendingUp> = {
      financial: TrendingUp,
      cooperation: Globe,
      energy: Zap,
      development: Lightbulb,
      training: Users,
    };
    return icons[sector] || Building2;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Caricamento progetto...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !project) {
    notFound();
  }

  const translation = project.translations[0];
  if (!translation) {
    notFound();
  }

  // Map project data
  const sectorUI = SECTOR_DB_TO_UI[project.sector] || 'other';
  const Icon = getSectorIcon(sectorUI);
  const location = COUNTRY_NAMES[project.country] || project.country;
  const year = project.startDate ? new Date(project.startDate).getFullYear() : new Date().getFullYear();
  const isOngoing = !project.endDate || new Date(project.endDate) > new Date();

  // Find prev/next projects
  const allProjects = allProjectsData?.items || [];
  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Parse results from description if available
  const resultsText = translation.results || '';
  const results = resultsText
    ? resultsText.replace(/<[^>]*>/g, '').split('\n').filter(r => r.trim())
    : [];

  // Parse gallery images for lightbox
  const galleryImages = parseGallery(project.gallery);
  const lightboxImages = galleryToLightboxImages(galleryImages);
  const { openLightbox, LightboxComponent } = useLightbox(lightboxImages);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={project.featuredImage || '/images/placeholder-project.jpg'}
            alt={translation.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/75 to-slate-900/60" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/progetti"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna ai progetti
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {SECTOR_LABELS[sectorUI] || sectorUI}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                !isOngoing
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {!isOngoing ? 'Completato' : 'In corso'}
              </span>
              {project.isFeatured && (
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-amber-500/20 text-amber-300">
                  In Evidenza
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl text-white mb-6 max-w-4xl">
              {translation.title}
            </h1>

            {translation.subtitle && (
              <p className="text-xl text-white/80 mb-6 max-w-3xl">
                {translation.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {year}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Info Cards */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 -mt-20 relative z-10">
            {translation.client && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">Cliente</h3>
                <p className="font-semibold text-slate-800">{translation.client}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Settore</h3>
              <p className="font-semibold text-slate-800">{SECTOR_LABELS[sectorUI] || sectorUI}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm text-slate-600 mb-1">Periodo</h3>
              <p className="font-semibold text-slate-800">
                {year}{project.endDate ? ` - ${new Date(project.endDate).getFullYear()}` : ' - In corso'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Descrizione del Progetto
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: translation.description }}
                />
              </motion.div>

              {/* Challenge Section */}
              {translation.challenge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    La Sfida
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ __html: translation.challenge }}
                  />
                </motion.div>
              )}

              {/* Solution Section */}
              {translation.solution && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    La Soluzione
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ __html: translation.solution }}
                  />
                </motion.div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Galleria
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {galleryImages.map((image, index) => (
                      <button
                        key={image.url}
                        onClick={() => openLightbox(index)}
                        className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={image.url}
                          alt={image.title || `${translation.title} - Immagine ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Caption overlay */}
                        {(image.title || image.description) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            {image.title && (
                              <h3 className="text-white font-semibold text-sm">{image.title}</h3>
                            )}
                            {image.description && (
                              <p className="text-white/80 text-xs mt-1 line-clamp-2">{image.description}</p>
                            )}
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-medium">
                            Visualizza
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Results */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 border border-slate-200 sticky top-24"
              >
                {/* Results Section */}
                {results.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-secondary" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Risultati</h3>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {results.slice(0, 6).map((result, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Info */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Stato</h4>
                      <p className="text-secondary font-bold text-lg">
                        {isOngoing ? 'In corso' : 'Completato'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Link
                    href="/consulenza"
                    className="block w-full text-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Richiedi Consulenza
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {prevProject ? (
              <Link
                href={`/progetti/${prevProject.slug}`}
                className="flex items-center gap-4 group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm text-slate-600">Progetto precedente</p>
                  <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                    {prevProject.translations[0]?.title || 'Progetto'}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextProject ? (
              <Link
                href={`/progetti/${nextProject.slug}`}
                className="flex items-center gap-4 group text-right"
              >
                <div>
                  <p className="text-sm text-slate-600">Progetto successivo</p>
                  <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                    {nextProject.translations[0]?.title || 'Progetto'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Vuoi realizzare un progetto simile?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Contattaci per una consulenza gratuita. Il nostro team ti aiuterà a trovare
              le migliori soluzioni per il tuo progetto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consulenza"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Richiedi Consulenza
              </Link>
              <Link
                href="/contatti"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-colors"
              >
                Contattaci
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <LightboxComponent />
    </div>
  );
}
