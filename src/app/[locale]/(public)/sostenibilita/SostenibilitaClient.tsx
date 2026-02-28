'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Leaf,
  Recycle,
  Sun,
  Wind,
  Droplets,
  TreeDeciduous,
  Target,
  BarChart3,
  Award,
  Globe,
  Heart,
  Users,
  Download,
  FileCheck,
  ShieldCheck,
  Building2,
  Play,
  Zap,
  Factory,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Gauge,
  Battery,
  Building,
  Tv,
  Briefcase,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

// Count-up animation component
function CountUp({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const pillars = [
  {
    icon: Leaf,
    key: 'environmental',
    color: 'text-emerald-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
  },
  {
    icon: Users,
    key: 'social',
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200 hover:border-blue-400',
  },
  {
    icon: BarChart3,
    key: 'governance',
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    borderColor: 'border-purple-200 hover:border-purple-400',
  },
];

const initiatives = [
  { icon: Sun, key: 'solar' },
  { icon: Recycle, key: 'waste' },
  { icon: TreeDeciduous, key: 'reforestation' },
  { icon: Droplets, key: 'water' },
  { icon: Wind, key: 'emissions' },
  { icon: Heart, key: 'community' },
];

const goals = [
  { value: 50, suffix: '%', key: 'emissions', icon: Factory, color: 'from-red-500 to-orange-500' },
  { value: 100, suffix: '%', key: 'renewable', icon: Zap, color: 'from-amber-500 to-yellow-500' },
  { value: 0, suffix: '', key: 'waste', icon: Recycle, color: 'from-emerald-500 to-green-500' },
  { value: 10, suffix: 'k', key: 'trees', icon: TreeDeciduous, color: 'from-green-500 to-teal-500' },
];

const plants = [
  {
    type: 'wind',
    title: 'Impianto Eolico',
    location: 'Foiano di Val Fortore',
    locality: 'Località Piano Del Casino',
    icon: Wind,
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-sky-50 to-blue-100',
    specs: [
      { label: 'In funzione dal', value: '2001' },
      { label: 'Aerogeneratori', value: '2 tripala' },
      { label: 'Potenza unitaria', value: '600 kW' },
      { label: 'Potenza totale', value: '1.2 MW' },
    ],
    description: 'L\'energia elettrica prodotta dal singolo aerogeneratore è raccolta in MT attraverso un cavidotto aereo. Un sistema di linee aeree prosegue fino a San Marco dei Cavoti dove l\'energia è trasformata e consegnata alla rete pubblica.',
  },
  {
    type: 'solar',
    title: 'Impianto Fotovoltaico',
    location: 'Montesano sulla Marcellana',
    locality: 'Località Spigno',
    icon: Sun,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    specs: [
      { label: 'Tipologia', value: 'Campo' },
      { label: 'Moduli', value: '675 W cad.' },
      { label: 'Configurazione', value: 'Doppia fila' },
      { label: 'Potenza', value: '900 kWp' },
    ],
    description: 'Impianto fotovoltaico da campo, composto da moduli fotovoltaici disposti in configurazione "doppia fila", ancorati al suolo per mezzo di strutture fisse.',
  },
  {
    type: 'solar-storage',
    title: 'Impianto Fotovoltaico con Storage',
    location: 'Moliterno (PZ)',
    locality: 'Località San Giovanni',
    icon: Battery,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    specs: [
      { label: 'Inverter', value: '12 kW trifase' },
      { label: 'Produzione', value: '12 kW' },
      { label: 'Batterie', value: '8 x 5.12 kWh' },
      { label: 'Storage totale', value: '40.96 kWh' },
    ],
    description: 'Sistema integrato con accumulo energetico per ottimizzare l\'autoconsumo e garantire continuità di alimentazione.',
  },
];

const certifications = [
  {
    name: 'ISO 9001:2015',
    description: 'Sistema di Gestione Qualità',
    file: '/documents/certificazioni/iso-9001.pdf',
    badge: '/images/certifications/iso-9001.svg',
  },
  {
    name: 'ISO 14001:2015',
    description: 'Sistema di Gestione Ambientale',
    file: '/documents/certificazioni/iso-14001.pdf',
    badge: '/images/certifications/iso-14001.svg',
  },
  {
    name: 'SOA',
    description: 'Attestazione Lavori Pubblici',
    file: '/documents/certificazioni/soa-2025.pdf',
    badge: '/images/certifications/soa.svg',
  },
  {
    name: 'ISO 50001',
    description: 'Gestione Energia',
    file: '/documents/certificazioni/iso-50001.pdf',
    badge: '/images/certifications/iso-50001.svg',
  },
  {
    name: 'Parità di Genere',
    description: 'Certificazione UNI/PdR 125:2022',
    file: '/documents/certificazioni/parita-genere.jpg',
    badge: '/images/certifications/parita-genere.svg',
  },
  {
    name: 'Strategic Energy',
    description: 'Certificazione Energetica',
    file: '/documents/certificazioni/strategic-energy.pdf',
    badge: '/images/certifications/strategic-energy.svg',
  },
];

export function SostenibilitaClient() {
  const t = useTranslations('sustainability');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-14 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradient - green/sustainability theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing orbs */}
          <motion.div
            className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-green-400/25 blur-[120px]"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/15 blur-[150px]"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Leaf pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leafPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 5 Q45 20 30 40 Q15 20 30 5" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leafPattern)" />
          </svg>

          {/* Floating leaves */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
            >
              <Leaf className="w-6 h-6 text-white/20" />
            </motion.div>
          ))}
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
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-emerald-300 rounded-full mb-6 border border-emerald-400/20"
            >
              <Leaf className="w-5 h-5" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </motion.div>
            <h1 className="text-3xl xs:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Muto - Full Width */}
      <section className="bg-black">
        <div className="relative aspect-video w-full max-h-[50vh] sm:max-h-none">
          <iframe
            src="https://www.youtube-nocookie.com/embed/cZxhbNt-t0M?autoplay=1&mute=1&loop=1&playlist=cZxhbNt-t0M&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3"
            title="Sostenibilità Gruppo Cestari"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </section>

      {/* ESG Pillars */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="esgGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0L0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#esgGrid)" className="text-slate-900" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-100 text-emerald-700 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">ESG Framework</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              {t('pillars.title')}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              {t('pillars.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative ${pillar.bgColor} rounded-2xl p-5 sm:p-6 lg:p-8 border-2 ${pillar.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 group`}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <pillar.icon className="w-full h-full" />
                </div>

                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${pillar.iconBg} rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${pillar.color} mb-3 sm:mb-4`}>
                  {t(`pillars.items.${pillar.key}.title`)}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                  {t(`pillars.items.${pillar.key}.description`)}
                </p>
                <ul className="space-y-3">
                  {['point1', 'point2', 'point3'].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 className={`w-5 h-5 ${pillar.color} shrink-0 mt-0.5`} />
                      {t(`pillars.items.${pillar.key}.${point}`)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === SEZIONE: Missione Brasile === */}
      <section className="relative py-12 sm:py-16 lg:py-28 overflow-hidden bg-slate-50">
        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Video - A sinistra questa volta */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <div className="relative aspect-video bg-slate-900">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/ihI2R_CpXiA?rel=0&modestbranding=1"
                    title="Missione Brasile - Gruppo Cestari"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-semibold mb-6">
                <Briefcase className="w-4 h-4" />
                Cooperazione Internazionale
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                Missione{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  Brasile
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                La cooperazione internazionale per lo sviluppo sostenibile in Sud America.
                Incontri istituzionali ai massimi livelli per costruire partnership strategiche
                che uniscono crescita economica e tutela ambientale.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Le nostre missioni in Brasile hanno consolidato rapporti con ministeri e istituzioni locali,
                aprendo la strada a progetti congiunti nel settore delle energie rinnovabili e della bioeconomia.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === SEZIONE 3: Camera dei Deputati - Sud Polo Magnetico Piano Mattei === */}
      <section className="relative py-12 sm:py-16 lg:py-28 overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-amber-800">
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200 text-sm font-semibold mb-4 sm:mb-6">
                <Building className="w-4 h-4" />
                Camera dei Deputati
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Sud Polo Magnetico:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                  Piano Mattei
                </span>
              </h2>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Il convegno &quot;Sud Polo Magnetico: Piano Mattei&quot; alla Camera dei Deputati rappresenta
                un momento fondamentale per il dibattito sulla cooperazione internazionale e lo sviluppo sostenibile.
              </p>
              <p className="text-white/70 leading-relaxed">
                L&apos;intervento di Alfredo Carmine Cestari illustra la visione strategica del Gruppo
                per il rilancio del Mezzogiorno come hub energetico e porta verso l&apos;Africa.
              </p>
            </motion.div>

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <div className="relative aspect-video bg-slate-900">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/EQrsrjb9Jho?start=4861&rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    title="Sud Polo Magnetico: Piano Mattei - Camera dei Deputati"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === SEZIONE 4: TG Ambiente - Sud Polo Magnetico === */}
      <section className="relative py-12 sm:py-16 lg:py-28 overflow-hidden bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-[80px]"
            animate={{ scale: [1.2, 1, 1.2], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Video - A sinistra */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <div className="relative aspect-video bg-slate-900">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/6vFzdLxsDsY?rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    title="TG Ambiente - Sud Polo Magnetico"
                  />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-sm font-semibold mb-4 sm:mb-6">
                <Tv className="w-4 h-4" />
                TG Ambiente
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Sud Polo{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300">
                  Magnetico
                </span>
              </h2>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                L&apos;iniziativa per il rilancio sostenibile del Mezzogiorno d&apos;Italia.
                Un progetto ambizioso che unisce sviluppo economico, tutela ambientale e valorizzazione
                delle risorse locali.
              </p>
              <p className="text-white/70 leading-relaxed">
                Nell&apos;intervista ad Alfredo Cestari, i dettagli del progetto che sta ridisegnando
                il futuro del Sud Italia attraverso investimenti in energie rinnovabili e cooperazione internazionale.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="goalsPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goalsPattern)" className="text-slate-900" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Target className="w-4 h-4" />
              Obiettivi 2030
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              {t('goals.title')}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              {t('goals.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <motion.div
                  key={goal.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all group overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>

                  {/* Animated number */}
                  <div className={`relative text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r ${goal.color} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                    <CountUp value={goal.value} suffix={goal.suffix} duration={2} />
                  </div>

                  <div className="relative text-slate-600 font-medium">
                    {t(`goals.items.${goal.key}`)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900" />

        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Dot pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="initiativesDots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#initiativesDots)" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-white/10 backdrop-blur-sm text-emerald-300 rounded-full mb-4 border border-emerald-400/20">
              <Recycle className="w-4 h-4" />
              <span className="text-sm font-medium">Le Nostre Iniziative</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {t('initiatives.title')}
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              {t('initiatives.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 lg:p-6 border border-white/20 hover:bg-white/20 transition-all group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/30 transition-colors">
                  <initiative.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1 sm:mb-2">
                  {t(`initiatives.items.${initiative.key}.title`)}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 line-clamp-3 sm:line-clamp-none">
                  {t(`initiatives.items.${initiative.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* I Nostri Impianti - Energia Rinnovabile */}
      <section className="relative py-14 sm:py-18 lg:py-24 bg-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="plantsGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="currentColor" />
                <circle cx="0" cy="0" r="1" fill="currentColor" />
                <circle cx="80" cy="0" r="1" fill="currentColor" />
                <circle cx="0" cy="80" r="1" fill="currentColor" />
                <circle cx="80" cy="80" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#plantsGrid)" className="text-slate-900" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-amber-100 text-amber-700 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">S.E.R. Strategic Energy Resources</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
              I Nostri <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Impianti</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Energia Rinnovabile per un Futuro Sostenibile
            </p>
          </motion.div>

          {/* Intro Card - S.E.R. */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-primary/80 rounded-3xl p-8 lg:p-12 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]"
                  animate={{ scale: [1.2, 1, 1.2] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">S.E.R.</h3>
                      <p className="text-amber-300 text-sm font-medium">Strategic Energy Resources S.r.l.</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    La S.E.R. &quot;Strategic Energy Resources&quot; è una società a responsabilità limitata che opera nel settore della produzione elettrica da fonti rinnovabili attraverso l&apos;adozione di tecnologie all&apos;avanguardia che assicurano alta efficienza a fronte di ridotti impatti ambientali.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    La società ha diversi impianti di proprietà sul territorio nazionale per la produzione di energia rinnovabile. Abbiamo in sviluppo diversi impianti sia di piccola taglia che parchi eolici di diversi megawatt.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <Wind className="w-10 h-10 text-sky-400 mb-3" />
                    <h4 className="text-white font-semibold mb-1">Eolico</h4>
                    <p className="text-white/60 text-sm">Parchi eolici in sviluppo</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <Sun className="w-10 h-10 text-amber-400 mb-3" />
                    <h4 className="text-white font-semibold mb-1">Fotovoltaico</h4>
                    <p className="text-white/60 text-sm">Residenziale & Industriale</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <Gauge className="w-10 h-10 text-emerald-400 mb-3" />
                    <h4 className="text-white font-semibold mb-1">Efficienza</h4>
                    <p className="text-white/60 text-sm">Ottimizzazione consumi</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <Battery className="w-10 h-10 text-teal-400 mb-3" />
                    <h4 className="text-white font-semibold mb-1">Storage</h4>
                    <p className="text-white/60 text-sm">Sistemi di accumulo</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plants Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {plants.map((plant, index) => {
              const Icon = plant.icon;
              return (
                <motion.div
                  key={plant.type}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -8 }}
                  className={`relative ${plant.bgColor} rounded-2xl p-4 sm:p-5 lg:p-8 border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden`}
                >
                  {/* Decorative background icon */}
                  <div className="absolute -top-4 -right-4 opacity-10">
                    <Icon className="w-32 h-32" />
                  </div>

                  {/* Icon */}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${plant.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>

                  {/* Title & Location */}
                  <h3 className="relative text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
                    {plant.title}
                  </h3>
                  <div className="relative flex items-center gap-2 text-slate-600 mb-3 sm:mb-4">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{plant.location}</span>
                  </div>
                  <p className="relative text-xs text-slate-500 mb-4 sm:mb-5 italic">
                    {plant.locality}
                  </p>

                  {/* Specs */}
                  <div className="relative space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                    {plant.specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600">{spec.label}</span>
                        <span className={`font-bold bg-gradient-to-r ${plant.color} bg-clip-text text-transparent`}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="relative text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {plant.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-slate-600 max-w-2xl mx-auto">
              Riguardo al fotovoltaico, la S.E.R. si è focalizzata sulla progettazione ed ottimizzazione dei consumi energetici per edifici sia di natura residenziale che industriale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-slate-50 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="certPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#certPattern)" className="text-slate-900" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/10 text-primary rounded-full mb-4">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Qualità Certificata</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              {t('certifications.title')}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              {t('certifications.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.a
                key={cert.name}
                href={cert.file}
                target="_blank"
                rel="noopener noreferrer"
                download
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-slate-200 hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Verified badge */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">Verificato</span>
                  </span>
                </div>

                {/* Certification Badge Image */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={cert.badge}
                    alt={cert.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  {cert.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                  {cert.description}
                </p>

                {/* Download button */}
                <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                  <Download className="w-4 h-4" />
                  Scarica certificato
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Report & CTA Combined Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [-50, 50, -50] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[120px]"
            animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/15 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Animated particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 4) * 20}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}
          {/* Wave pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="combinedWaves" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#combinedWaves)" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Slide 1: Report Download */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/10"
            >
              {/* Document preview mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative mx-auto mb-8 w-28 h-36"
              >
                <div className="absolute inset-0 bg-white rounded-lg shadow-2xl transform rotate-3" />
                <div className="absolute inset-0 bg-white rounded-lg shadow-2xl transform -rotate-3" />
                <div className="relative bg-white rounded-lg shadow-2xl p-3 flex flex-col items-center justify-center h-full">
                  <Globe className="w-10 h-10 text-emerald-600 mb-2" />
                  <div className="w-14 h-1 bg-slate-200 rounded mb-1" />
                  <div className="w-10 h-1 bg-slate-200 rounded mb-1" />
                  <div className="w-12 h-1 bg-slate-200 rounded" />
                </div>
              </motion.div>

              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full mb-4 border border-emerald-400/30">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Report ESG 2025</span>
                </span>

                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {t('report.title')}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('report.description')}
                </p>
                <button
                  onClick={() => toast.info('Il Report di Sostenibilità 2025 sarà disponibile a breve. Contattaci per maggiori informazioni.')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg group"
                >
                  <Download className="w-5 h-5" />
                  {t('report.download')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Slide 2: CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/10"
            >
              <div className="text-center">
                {/* Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <TreeDeciduous className="w-10 h-10 text-white" />
                </motion.div>

                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-sm font-medium mb-4 border border-teal-400/30">
                  <Heart className="w-4 h-4" />
                  Partner per la Sostenibilità
                </span>

                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {t('cta.title')}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {t('cta.subtitle')}
                </p>
                <Link
                  href="/contatti"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg group"
                >
                  {t('cta.button')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
