'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  FileText,
  FolderOpen,
  Bell,
  LineChart,
  Users,
  Shield,
  ArrowRight,
  Building2,
} from 'lucide-react';

const clientBenefits = [
  { key: 'documents', icon: FileText },
  { key: 'applications', icon: FolderOpen },
  { key: 'notifications', icon: Bell },
  { key: 'tracking', icon: LineChart },
];

export default function AreaRiservataPage() {
  const t = useTranslations('areaRiservata');
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isContentInView = useInView(contentRef, { once: true, margin: '-50px' });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900" />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/30 blur-[80px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />


        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {t('hero.title').split(' ').slice(0, -2).join(' ')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-primary-light to-secondary bg-clip-text text-transparent">
                {t('hero.title').split(' ').slice(-2).join(' ')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              {t('hero.subtitle')}
            </motion.p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Main Content - Two Columns */}
      <section ref={contentRef} className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

            {/* Client Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isContentInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-full">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-secondary/10 to-emerald-500/10 rounded-3xl blur-2xl" />

                <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                        {t('client.title')}
                      </h2>
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div className="space-y-4 mb-10">
                    {clientBenefits.map((benefit, idx) => {
                      const Icon = benefit.icon;
                      return (
                        <motion.div
                          key={benefit.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isContentInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {t(`client.benefits.${benefit.key}`)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-4">
                    <Link href="/login?role=client">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                      >
                        {t('client.login')}
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>

                    <div className="text-center">
                      <p className="text-slate-500 text-sm mb-2">{t('client.noAccount')}</p>
                      <Link href="/register">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-primary text-primary font-bold text-lg rounded-xl hover:bg-primary/5 transition-all"
                        >
                          {t('client.register')}
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Admin Section - Clean Professional Design */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isContentInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative h-full">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-slate-200/50 to-slate-300/30 rounded-3xl blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-2xl" />

                <div className="relative h-full bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-400/30">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                        {t('admin.title')}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mb-10">
                    {/* Info Box */}
                    <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                          {t('admin.badge')}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium mb-2">
                        {t('admin.description')}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {t('admin.subdescription')}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('admin.features.content')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('admin.features.analytics')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('admin.features.users')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('admin.features.settings')}
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="mt-auto">
                    <Link href="/login?role=admin">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold text-lg rounded-xl shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-400/40 transition-all"
                      >
                        {t('admin.login')}
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
