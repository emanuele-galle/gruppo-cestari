'use client';

import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Target,
  Eye,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { YouTubePlayer } from '@/components/ui/youtube-player';

const mainVideoId = 'nQ-S2Zo6PI4';

export function AboutSection() {
  const t = useTranslations('home.about');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ==================== DARK SECTION - VIDEO ==================== */}
      <div className="relative bg-slate-950 pb-16 lg:pb-24">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Floating orbs - hidden on mobile to prevent overflow */}
        <motion.div
          className="hidden md:block absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[150px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container relative mx-auto px-4 lg:px-8 pt-24 lg:pt-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 lg:mb-16"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md text-white/80 text-sm font-medium mb-6 border border-white/10"
              whileHover={{ scale: 1.05 }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('badge') || 'Il Gruppo Cestari'}
            </motion.span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('title') || 'Chi'}{' '}
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('titleHighlight') || 'Siamo'}
              </span>
            </h2>

            <p className="text-lg lg:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle') || 'Una realtà poliedrica nel panorama italiano, europeo ed extraeuropeo'}
            </p>
          </motion.div>

          {/* VIDEO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-6xl mx-auto"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-500/15 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />

            {/* Video Container */}
            <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <YouTubePlayer
                videoId={mainVideoId}
                title="Gruppo Cestari - La Nostra Storia"
                muted
                loop
                showControls
                thumbnailQuality="hqdefault"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ==================== LIGHT SECTION - CONTENT ==================== */}
      <div className="relative bg-white py-24 lg:py-32">
        {/* Elegant background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-slate-200 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Quote-style Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mb-20"
            >
              <div className="text-center">
                <p className="text-xl lg:text-2xl text-slate-700 leading-relaxed max-w-4xl mx-auto font-light">
                  {t('description1') ||
                    "Fondato negli anni Ottanta dall'Ing. Alfredo C. Cestari, che lo presiede con più di 20 sedi italiane ed estere, il Gruppo Cestari ha progressivamente ampliato la propria sfera di attività e rappresenta oggi una realtà poliedrica nell'ambito del panorama italiano, europeo ed extraeuropeo."}
                </p>
              </div>
            </motion.div>

            {/* Mission & Vision - Elegant Layout */}
            <div className="grid lg:grid-cols-2 gap-0 mb-16">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-primary font-semibold">La nostra</span>
                    <h3 className="text-2xl font-bold text-slate-900">Mission</h3>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t('mission') ||
                    'Aiutiamo imprese, enti pubblici e territori a crescere in modo sostenibile in tutti i paesi del mondo. Le relazioni con organismi internazionali e decenni di esperienza fanno del Gruppo Cestari un partner strategico insostituibile.'}
                </p>
                {/* Decorative line */}
                <div className="absolute bottom-0 left-10 right-10 lg:bottom-10 lg:left-auto lg:right-0 lg:top-10 lg:w-px lg:h-auto h-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative p-10 lg:p-12"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/10 to-emerald-500/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-secondary font-semibold">La nostra</span>
                    <h3 className="text-2xl font-bold text-slate-900">Vision</h3>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t('vision') ||
                    "Investire sempre di più sull'energia rinnovabile creando impianti ecosostenibili per combattere il cambiamento climatico, preservando l'ambiente, il pianeta e le generazioni future."}
                </p>
              </motion.div>
            </div>

            {/* Elegant CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-slate-100"
            >
              <Link
                href="/chi-siamo"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all duration-300"
              >
                <span>{t('cta') || 'Scopri la nostra storia'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/societa"
                className="group inline-flex items-center gap-3 text-slate-600 font-medium hover:text-primary transition-colors"
              >
                <span>{t('companiesLink') || 'Le nostre 10 società'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
