'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import {
  Banknote,
  Globe2,
  Leaf,
  FileSearch,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Phone,
  Search,
  Target,
  Rocket,
  TrendingUp,
  Award,
  Quote,
  Building2,
  Zap,
  Factory,
  Users,
} from 'lucide-react';

export function ServiziClient() {
  const t = useTranslations('services');

  const services = [
    {
      id: 'financial',
      title: t('items.financial.title'),
      description: t('items.financial.description'),
      icon: Banknote,
      color: 'from-primary to-blue-700',
      borderColor: 'border-primary',
      image: '/images/photos/services-finance-new.jpg',
      features: [
        t('items.financial.features.analysis'),
        t('items.financial.features.planning'),
        t('items.financial.features.funding'),
        t('items.financial.features.management'),
      ],
    },
    {
      id: 'international',
      title: t('items.international.title'),
      description: t('items.international.description'),
      icon: Globe2,
      color: 'from-violet-500 to-purple-700',
      borderColor: 'border-violet-500',
      image: '/images/photos/services-global-new.jpg',
      features: [
        t('items.international.features.projects'),
        t('items.international.features.partnerships'),
        t('items.international.features.development'),
        t('items.international.features.training'),
      ],
    },
    {
      id: 'energy',
      title: t('items.energy.title'),
      description: t('items.energy.description'),
      icon: Leaf,
      color: 'from-secondary to-emerald-600',
      borderColor: 'border-secondary',
      image: '/images/photos/services-energy-new.jpg',
      features: [
        t('items.energy.features.solar'),
        t('items.energy.features.efficiency'),
        t('items.energy.features.consulting'),
        t('items.energy.features.certification'),
      ],
    },
    {
      id: 'grants',
      title: t('items.grants.title'),
      description: t('items.grants.description'),
      icon: FileSearch,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500',
      image: '/images/photos/services-grants-new.jpg',
      features: [
        t('items.grants.features.search'),
        t('items.grants.features.writing'),
        t('items.grants.features.submission'),
        t('items.grants.features.reporting'),
      ],
    },
    {
      id: 'business',
      title: t('items.business.title'),
      description: t('items.business.description'),
      icon: Briefcase,
      color: 'from-slate-600 to-slate-800',
      borderColor: 'border-slate-600',
      image: '/images/photos/services-business-new.jpg',
      features: [
        t('items.business.features.strategy'),
        t('items.business.features.operations'),
        t('items.business.features.digital'),
        t('items.business.features.growth'),
      ],
    },
    {
      id: 'training',
      title: t('items.training.title'),
      description: t('items.training.description'),
      icon: GraduationCap,
      color: 'from-rose-500 to-pink-600',
      borderColor: 'border-rose-500',
      image: '/images/photos/services-training-new.jpg',
      features: [
        t('items.training.features.corporate'),
        t('items.training.features.specialized'),
        t('items.training.features.workshops'),
        t('items.training.features.coaching'),
      ],
    },
  ];

  const methodSteps = [
    { icon: Search, title: 'Analisi', description: 'Studio approfondito delle esigenze e del contesto' },
    { icon: Target, title: 'Strategia', description: 'Piano d\'azione personalizzato e misurabile' },
    { icon: Rocket, title: 'Implementazione', description: 'Esecuzione con monitoraggio continuo' },
    { icon: TrendingUp, title: 'Risultati', description: 'Misurazione e ottimizzazione costante' },
  ];

  const stats = [
    { value: '1000+', label: 'MW rinnovabili realizzati' },
    { value: '500+', label: 'Progetti completati' },
    { value: '40+', label: 'Anni di esperienza' },
    { value: '15', label: 'Sedi nel mondo' },
  ];

  const recognitions = [
    {
      title: 'Top 250 Creatori di Ricchezza',
      source: 'Rivista Capital - Dicembre 2024',
      quote: 'Il Gruppo Cestari inserito tra i 250 migliori creatori di ricchezza in Italia',
      icon: Award,
    },
    {
      title: 'Premio Palma Bianca 2024',
      source: 'Eccellenze Italiane',
      quote: 'Per l\'encomiabile impegno dimostrato nella cooperazione internazionale Italia-Africa',
      icon: Award,
    },
    {
      title: 'Primi in Italia Superbonus 110%',
      source: 'Gruppo Cestari',
      quote: 'Tra i primi in Italia a completare progetti legati al Superbonus 110%',
      icon: Award,
    },
  ];

  const sectors = [
    { icon: Building2, name: 'Pubblica Amministrazione' },
    { icon: Zap, name: 'Energia' },
    { icon: Factory, name: 'Infrastrutture' },
    { icon: Banknote, name: 'Finanza' },
    { icon: Globe2, name: 'Internazionale' },
    { icon: GraduationCap, name: 'Formazione' },
    { icon: Leaf, name: 'Agricoltura' },
    { icon: Users, name: 'Industria' },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradient - blue/primary theme for services */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/80 to-blue-900" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing orbs */}
          <motion.div
            className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-400/25 blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[150px]"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="servicesGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#servicesGrid)" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-blue-300 rounded-full mb-6 border border-blue-400/20"
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </motion.div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="relative py-16 lg:py-20 bg-slate-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px]"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground text-sm font-medium mb-6">
                <Briefcase className="w-4 h-4" />
                40+ Anni di Esperienza
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Partner Strategico per il{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Successo Aziendale
                </span>
              </h2>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Dal 1982 affianchiamo imprese e istituzioni nella realizzazione di progetti complessi,
                dalla consulenza finanziaria allo sviluppo internazionale.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  Consulenza strategica personalizzata
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  Network internazionale consolidato
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  Risultati misurabili e trasparenti
                </li>
              </ul>
              <Link
                href="/chi-siamo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg"
              >
                Scopri la Nostra Storia
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="/images/photos/founder/cestari-meeting.jpg"
                  alt="Ing. Alfredo Cestari in riunione"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servizi" ref={ref} className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-primary mb-4">Cosa Offriamo</span>
            <h2 className="text-slate-800 mb-4">Soluzioni Complete per il Tuo Business</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Un ecosistema integrato di competenze al servizio della crescita sostenibile
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  id={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className={`group bg-white rounded-2xl border-l-4 ${service.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Icon overlay */}
                    <div className={`absolute bottom-4 left-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 mb-5 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Link */}
                    <Link
                      href="/consulenza"
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                    >
                      {t('learnMore')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-secondary mb-4">Come Lavoriamo</span>
            <h2 className="text-slate-800 mb-4">Il Nostro Metodo</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Un approccio strutturato per garantire risultati concreti e misurabili
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center p-6"
                >
                  {/* Step number */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-7xl font-bold text-slate-100">
                    0{index + 1}
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 mb-4 shadow-lg shadow-primary/30">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>

                  {/* Connector line - positioned to connect icons */}
                  {index < methodSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-[4rem] left-[calc(50%+2rem)] right-[-1.5rem] h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/photos/solar-panels.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              I Nostri Numeri
            </span>
            <h2 className="text-white mb-4">Risultati che Parlano</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Oltre 40 anni di esperienza al servizio delle imprese
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognitions Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-primary mb-4">
              <Award className="w-4 h-4" />
              Riconoscimenti
            </span>
            <h2 className="text-slate-800 mb-4">Eccellenza Riconosciuta</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Premi e riconoscimenti che testimoniano il nostro impegno
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {recognitions.map((recognition, index) => {
              const Icon = recognition.icon;
              return (
                <motion.div
                  key={recognition.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-8 bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                >
                  {/* Quote icon */}
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{recognition.title}</h3>

                  <p className="text-slate-600 italic mb-4">&ldquo;{recognition.quote}&rdquo;</p>

                  <div className="text-sm text-primary font-medium">{recognition.source}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Founder Quote with Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 relative overflow-hidden rounded-2xl"
          >
            <div className="grid lg:grid-cols-5 items-stretch">
              {/* Image side */}
              <div className="lg:col-span-2 relative h-64 lg:h-auto">
                <img
                  src="/images/photos/ing-cestari.jpg"
                  alt="Ing. Alfredo Cestari"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary lg:bg-gradient-to-r lg:from-transparent lg:to-primary" />
              </div>
              {/* Quote side */}
              <div className="lg:col-span-3 bg-gradient-to-r from-primary to-blue-700 p-8 lg:p-12 flex flex-col justify-center">
                <Quote className="w-10 h-10 mb-4 opacity-50 text-white" />
                <p className="text-xl lg:text-2xl font-medium italic mb-6 text-white leading-relaxed">
                  &ldquo;Abbiamo dimostrato – soprattutto alle imprese internazionali, ma anche a quelle nazionali del Nord Italia – che fare impresa al Sud è possibile.&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-white text-lg">Ing. Alfredo Cestari</div>
                  <div className="text-white/80">Fondatore e Presidente</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sectors Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-secondary mb-4">Settori</span>
            <h2 className="text-slate-800 mb-4">Competenze Trasversali</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Esperienza consolidata in molteplici settori strategici
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sectors.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <motion.div
                  key={sector.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group p-6 bg-slate-50 rounded-2xl text-center hover:bg-white hover:shadow-xl border border-transparent hover:border-primary/20 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary mb-4 transition-colors">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-800">{sector.name}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 bg-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-primary mb-4">Il Nostro Lavoro</span>
            <h2 className="text-slate-800 mb-4">Progetti e Collaborazioni</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Immagini che raccontano la nostra presenza internazionale
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: '/images/photos/missions/cestari-presidente-kenya.jpg', alt: 'Incontro con il Presidente del Kenya' },
              { src: '/images/photos/events/gala-eccellenze-01.jpg', alt: 'Gala Eccellenze Italiane' },
              { src: '/images/photos/missions/cestari-ministro-angola.jpg', alt: 'Missione in Angola' },
              { src: '/images/photos/events/cop30-brasile-01.jpg', alt: 'COP30 Brasile' },
            ].map((photo, index) => (
              <motion.div
                key={photo.alt}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium">{photo.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/photos/hero-home.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-primary/80" />
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                Inizia Ora
              </span>

              <h2 className="text-3xl md:text-4xl text-white mb-6">
                {t('cta.title')}
              </h2>

              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/consulenza"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {t('cta.consultation')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+39089952889"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
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
