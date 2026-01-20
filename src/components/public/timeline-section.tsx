'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Building2, Globe, Users, Zap, Award, Rocket } from 'lucide-react';

const milestones = [
  {
    year: '1980',
    titleKey: 'foundation',
    descKey: 'foundationDesc',
    icon: Building2,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    year: '1995',
    titleKey: 'expansion',
    descKey: 'expansionDesc',
    icon: Rocket,
    color: 'from-indigo-500 to-violet-600',
  },
  {
    year: '2005',
    titleKey: 'international',
    descKey: 'internationalDesc',
    icon: Globe,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    year: '2015',
    titleKey: 'energy',
    descKey: 'energyDesc',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
  },
  {
    year: '2024',
    titleKey: 'today',
    descKey: 'todayDesc',
    icon: Award,
    color: 'from-rose-500 to-pink-600',
  },
];

export function TimelineSection() {
  const t = useTranslations('home.timeline');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Rileva dispositivo mobile e preferenze accessibilita
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    };
    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkMobile();
    checkReducedMotion();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disabilita animazioni decorative su mobile o se prefers-reduced-motion
  const shouldAnimateOrbs = !isMobile && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ['0%', '100%']);
  const bgOpacity = useTransform(scrollYProgress, [0.5, 1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative pt-24 lg:pt-32 pb-6 lg:pb-8 overflow-hidden"
    >
      {/* Animated Gradient Background - Dark to Light */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-100" />

        {/* Animated mesh gradient overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          }}
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid Pattern - fading */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="timeline-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="70%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id="grid-mask">
                <rect width="100%" height="100%" fill="url(#grid-fade)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#timeline-grid)" mask="url(#grid-mask)" />
          </svg>
        </div>
      </div>

      {/* Animated floating orbs - disabilitati su mobile per performance */}
      {shouldAnimateOrbs && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px]"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px]"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px]"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />
        </>
      )}

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      {/* Floating particles - solo su desktop */}
      {shouldAnimateOrbs && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-md border border-white/20 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('badge')}
          </motion.span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                45 anni
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </span>{' '}
            {t('titleEnd')}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center line with gradient - transizione graduale tra breakpoint */}
          <div className="absolute left-4 xs:left-5 sm:left-6 md:left-8 lg:left-1/2 top-0 bottom-0 w-1 lg:-translate-x-1/2">
            {/* Background line */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent rounded-full" />
            {/* Animated progress line */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-500 via-violet-500 to-amber-500 rounded-full shadow-lg shadow-violet-500/30"
              style={{ height: lineHeight }}
            />
            {/* Glow effect */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b from-blue-400 to-violet-400 blur-md opacity-50"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Milestones */}
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            const isEven = index % 2 === 0;
            // Calculate opacity based on position (darker at top, lighter at bottom)
            const textOpacity = index < 3 ? 'text-white' : 'text-slate-700';
            const descOpacity = index < 3 ? 'text-white/60' : 'text-slate-500';
            const cardBg = index < 3
              ? 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20'
              : 'bg-white/80 backdrop-blur-md border-slate-200 hover:bg-white hover:border-slate-300 shadow-lg';

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center gap-6 lg:gap-12 mb-12 lg:mb-16 ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content card - spacing graduale */}
                <div
                  className={`flex-1 ml-14 xs:ml-16 sm:ml-20 md:ml-24 lg:ml-0 ${
                    isEven ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'
                  }`}
                >
                  <motion.div
                    whileHover={!isMobile ? { scale: 1.02, y: -5 } : undefined}
                    className={`inline-block p-5 xs:p-6 lg:p-8 rounded-xl xs:rounded-2xl border transition-all duration-300 ${cardBg}`}
                  >
                    <span
                      className={`text-5xl lg:text-6xl font-bold bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent`}
                    >
                      {milestone.year}
                    </span>
                    <h3 className={`text-xl lg:text-2xl font-semibold mt-3 mb-2 ${textOpacity}`}>
                      {t(milestone.titleKey)}
                    </h3>
                    <p className={`text-sm lg:text-base leading-relaxed ${descOpacity}`}>
                      {t(milestone.descKey)}
                    </p>
                  </motion.div>
                </div>

                {/* Center icon - touch target 44px+ */}
                <motion.div
                  whileHover={!isMobile ? { scale: 1.2, rotate: 5 } : undefined}
                  className={`absolute left-0 xs:left-1 sm:left-2 md:left-4 lg:left-1/2 lg:-translate-x-1/2 z-10 w-11 h-11 xs:w-12 xs:h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-xl`}
                >
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  {/* Pulse ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${milestone.color}`}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
                  />
                </motion.div>

                {/* Spacer for opposite side */}
                <div className="hidden lg:block flex-1" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA - "E la storia continua..." */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mt-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-300" />
          <span className="text-lg text-slate-500 tracking-wide">
            {t('continue')}
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-300" />
        </motion.div>
      </div>
    </section>
  );
}
