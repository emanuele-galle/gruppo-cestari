'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, MapPin, Zap, BarChart3, ChevronRight, Check, Sparkles } from 'lucide-react';

const services = [
  {
    key: 'financial',
    icon: FileText,
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    glowColor: 'blue',
    color: 'text-blue-600',
    colorLight: 'bg-blue-100',
    borderColor: 'border-blue-200',
    number: '01',
    image: '/images/photos/services-grants.jpg',
  },
  {
    key: 'cooperation',
    icon: MapPin,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-50 to-cyan-50',
    glowColor: 'emerald',
    color: 'text-emerald-600',
    colorLight: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    number: '02',
    image: '/images/photos/services-sud-polo.jpg',
  },
  {
    key: 'energy',
    icon: Zap,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-50 to-orange-50',
    glowColor: 'amber',
    color: 'text-amber-600',
    colorLight: 'bg-amber-100',
    borderColor: 'border-amber-200',
    number: '03',
    image: '/images/photos/services-energy.jpg',
  },
  {
    key: 'planning',
    icon: BarChart3,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-50 to-purple-50',
    glowColor: 'violet',
    color: 'text-violet-600',
    colorLight: 'bg-violet-100',
    borderColor: 'border-violet-200',
    number: '04',
    image: '/images/photos/services-feasibility.jpg',
  },
];

export function ServicesSection() {
  const t = useTranslations('home.services');
  const tServices = useTranslations('services');
  const tCommon = useTranslations('common');
  const [activeService, setActiveService] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Rileva dispositivo mobile per ottimizzare animazioni
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disabilita animazioni decorative su mobile
  const shouldAnimateOrbs = !isMobile;

  const currentService = services[activeService];
  const CurrentIcon = currentService.icon;

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Animated Background Elements - disabilitati su mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs - solo su desktop per performance */}
        {shouldAnimateOrbs && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="services-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-900" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#services-grid)" />
          </svg>
        </div>

        {/* Floating Geometric Shapes - solo su desktop */}
        {shouldAnimateOrbs && (
          <>
            <motion.div
              className="absolute top-32 right-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-60"
              animate={{ y: [0, -15, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/3 left-1/4 w-3 h-3 bg-emerald-400 rounded-full opacity-60"
              animate={{ y: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-violet-400 rounded-full opacity-40"
              animate={{ y: [0, -25, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />
          </>
        )}
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header with animated underline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('title')}
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Cosa{' '}
            <span className="relative inline-block">
              <span className={`bg-gradient-to-r ${currentService.gradient} bg-clip-text text-transparent`}>
                facciamo
              </span>
              <motion.span
                className={`absolute -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r ${currentService.gradient}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                key={activeService}
              />
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Quattro aree di competenza per supportare la tua crescita
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left - Service Selector */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              const isActive = index === activeService;

              return (
                <motion.button
                  key={service.key}
                  onClick={() => setActiveService(index)}
                  className={`w-full group relative flex items-center gap-4 xs:gap-5 p-4 xs:p-5 min-h-[72px] rounded-xl xs:rounded-2xl transition-all duration-500 text-left overflow-hidden ${
                    isActive
                      ? `bg-white ${service.borderColor} border-2 shadow-xl`
                      : 'bg-white/50 border-2 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-md active:scale-[0.98]'
                  }`}
                  whileHover={!isMobile ? { scale: isActive ? 1 : 1.02 } : undefined}
                  whileTap={!isMobile ? { scale: 0.98 } : undefined}
                >
                  {/* Background Glow for Active */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${service.bgGradient} opacity-50`}
                      layoutId="activeBg"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Number with gradient background */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${service.gradient} shadow-lg`
                      : 'bg-gray-100'
                  }`}>
                    <span className={`text-2xl font-bold transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}>
                      {service.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? service.color : 'text-gray-400'
                      }`} />
                      <h3 className={`text-lg font-bold transition-colors duration-300 truncate ${
                        isActive ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {tServices(`${service.key}.title`)}
                      </h3>
                    </div>
                    <p className={`text-sm transition-colors duration-300 line-clamp-1 ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {tServices(`${service.key}.shortDescription`) || tServices(`${service.key}.description`).substring(0, 50) + '...'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? `bg-white/80 ${service.color}` : 'bg-gray-50 text-gray-300'
                    }`}
                    animate={{ x: isActive ? 0 : -5, opacity: isActive ? 1 : 0.5 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              );
            })}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-gray-100"
            >
              {[
                { value: '45+', label: 'Anni' },
                { value: '500+', label: 'Progetti' },
                { value: '20+', label: 'Paesi' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${currentService.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Active Service Display */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative lg:sticky lg:top-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService}
                initial={{ opacity: 0, y: 30, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -30, rotateY: 10 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="relative"
                style={{ perspective: '1000px' }}
              >
                {/* Glow Effect */}
                <motion.div
                  className={`absolute -inset-4 bg-gradient-to-r ${currentService.gradient} rounded-[2rem] blur-2xl`}
                  animate={{
                    opacity: isHovering ? 0.3 : 0.15,
                    scale: isHovering ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Card */}
                <motion.div
                  className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Image with Parallax Effect */}
                  <div className="relative h-72 lg:h-80 overflow-hidden group">
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: isHovering ? 1.05 : 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image
                        src={currentService.image}
                        alt={tServices(`${currentService.key}.title`)}
                        fill
                        className="object-cover"
                      />
                    </motion.div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Animated Pattern Overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${currentService.gradient} mix-blend-overlay`}
                      animate={{ opacity: isHovering ? 0.3 : 0.1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Floating Number Badge */}
                    <motion.div
                      className={`absolute top-6 right-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${currentService.gradient} flex items-center justify-center shadow-2xl backdrop-blur-sm`}
                      animate={{
                        rotate: isHovering ? 5 : 0,
                        scale: isHovering ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-3xl font-bold text-white">{currentService.number}</span>
                    </motion.div>

                    {/* Icon + Title on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4"
                      >
                        <div className={`w-14 h-14 rounded-2xl ${currentService.colorLight} backdrop-blur-sm flex items-center justify-center shadow-lg`}>
                          <CurrentIcon className={`w-7 h-7 ${currentService.color}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                            {tServices(`${currentService.key}.title`)}
                          </h3>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 text-base">
                      {tServices(`${currentService.key}.description`)}
                    </p>

                    {/* Highlights with staggered animation */}
                    <div className="flex flex-wrap gap-3 mb-8">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * i }}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${currentService.bgGradient} ${currentService.borderColor} border`}
                        >
                          <Check className={`w-4 h-4 ${currentService.color}`} />
                          <span className="text-gray-700 text-sm font-semibold">
                            {tServices(`${currentService.key}.highlights.${i}`)}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/servizi#${currentService.key}`}
                      className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${currentService.gradient} text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                    >
                      {/* Button Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      <span className="relative">{tCommon('learnMore')}</span>
                      <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-20"
        >
          <Link
            href="/servizi"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Esplora tutti i nostri servizi</span>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentService.gradient} flex items-center justify-center`}>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
