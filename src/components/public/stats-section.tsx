'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Globe, TrendingUp, Users } from 'lucide-react';
import { useInView } from 'framer-motion';

const slides = [
  {
    id: 1,
    titleKey: 'slide1.title',
    highlightKey: 'slide1.highlight',
    descriptionKey: 'slide1.description',
    ctaKey: 'slide1.cta',
    ctaLink: '/consulenza',
    icon: TrendingUp,
    accentColor: 'from-primary to-blue-600',
    highlightColor: 'text-sky-300', // Azzurro chiaro - finanza
  },
  {
    id: 2,
    titleKey: 'slide2.title',
    highlightKey: 'slide2.highlight',
    descriptionKey: 'slide2.description',
    ctaKey: 'slide2.cta',
    ctaLink: '/servizi#energy',
    icon: Zap,
    accentColor: 'from-amber-500 to-orange-600',
    highlightColor: 'text-amber-400', // Giallo/Oro - energia
  },
  {
    id: 3,
    titleKey: 'slide3.title',
    highlightKey: 'slide3.highlight',
    descriptionKey: 'slide3.description',
    ctaKey: 'slide3.cta',
    ctaLink: '/servizi#cooperation',
    icon: Globe,
    accentColor: 'from-emerald-500 to-secondary',
    highlightColor: 'text-emerald-400', // Verde - cooperazione
  },
  {
    id: 4,
    titleKey: 'slide4.title',
    highlightKey: 'slide4.highlight',
    descriptionKey: 'slide4.description',
    ctaKey: 'slide4.cta',
    ctaLink: '/chi-siamo',
    icon: Users,
    accentColor: 'from-purple-500 to-primary',
    highlightColor: 'text-violet-400', // Viola - chi siamo
  },
];

export function StatsSection() {
  const t = useTranslations('home.slider');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Performance: disabilita animazioni decorative se utente preferisce reduced motion
  const prefersReducedMotion = useReducedMotion();
  // Performance: anima solo quando visibile nel viewport
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  // Detect mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(hover: none)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disable heavy animations on mobile for better performance
  const shouldAnimate = !prefersReducedMotion && isInView && !isMobile;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextSlide, 6000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden">
      {/* Static Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary to-slate-900" />

      {/* Animated Mesh Gradient - solo se visibile e motion permesso */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 opacity-60"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Floating Orbs - solo se visibile e motion permesso */}
      {shouldAnimate && (
        <>
          <motion.div
            className="absolute top-20 left-[10%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-[10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Static orbs fallback quando animazioni disabilitate */}
      {!shouldAnimate && (
        <>
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Static Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Geometric Shapes - solo se visibile e motion permesso */}
      {shouldAnimate && (
        <>
          <motion.div
            className="absolute top-[15%] right-[20%] w-4 h-4 bg-sky-400 rounded-full"
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-[60%] left-[15%] w-3 h-3 bg-amber-400 rounded-full"
            animate={{
              y: [0, 15, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute bottom-[25%] right-[25%] w-2 h-2 bg-emerald-400 rounded-full"
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="absolute top-[40%] left-[30%] w-6 h-6 border border-white/20 rounded-lg"
            animate={{
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-[35%] right-[15%] w-8 h-8 border border-white/10 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Animated Lines */}
          <motion.div
            className="absolute top-0 left-[40%] w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Sparkle Effects */}
          <motion.div
            className="absolute top-[20%] left-[25%] w-1 h-1 bg-white rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          />
          <motion.div
            className="absolute top-[70%] right-[35%] w-1 h-1 bg-white rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[45%] w-1 h-1 bg-white rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          />
        </>
      )}

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${slide.accentColor} mb-8 shadow-lg`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight mb-6">
                {t(slide.titleKey)}{' '}
                <span className={slide.highlightColor}>
                  {t(slide.highlightKey)}
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
                {t(slide.descriptionKey)}
              </p>

              {/* CTA */}
              <Link
                href={slide.ctaLink}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-primary font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {t(slide.ctaKey)}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            {/* Prev Button */}
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Slide precedente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Vai alla slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Slide successiva"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
