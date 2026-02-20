'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLightbox, type LightboxImage } from '@/components/ui/lightbox';
import {
  Target,
  Eye,
  Users,
  Building2,
  Award,
  Lightbulb,
  Handshake,
  MapPin,
  Leaf,
  Shield,
  Calendar,
  Play,
  Globe,
  Expand,
} from 'lucide-react';
import { YouTubePlayer } from '@/components/ui/youtube-player';

const valueKeys = [
  { icon: Shield, key: 'integrity', color: 'from-primary to-blue-700' },
  { icon: Lightbulb, key: 'innovation', color: 'from-amber-500 to-orange-600' },
  { icon: Users, key: 'collaboration', color: 'from-violet-600 to-purple-700' },
  { icon: Award, key: 'excellence', color: 'from-rose-500 to-pink-600' },
  { icon: Leaf, key: 'sustainability', color: 'from-secondary to-emerald-600' },
  { icon: Handshake, key: 'trust', color: 'from-cyan-500 to-blue-600' },
];

const milestoneKeys = ['origini', 'espansione', 'consolidamento', 'rafforzamento', 'internazionalizzazione', 'africa', 'sistemaPaese', 'energia', 'logistica', 'sostenibilita', 'aviazione', 'expo', 'europa', 'ecosistema', 'sudPoloMagnetico', 'zes2022', 'zesPianoMattei', 'zesOggi'];


const offices = [
  { city: 'Salerno', address: 'Via Don Minzoni, 1 – 84084 Fisciano (SA)', phone: '+39 089 952889', typeKey: 'headquarters', flag: '🇮🇹' },
  { city: 'Napoli', address: 'Centro Direzionale Isola A5 – 80143 Napoli (NA)', phone: '+39 081 7875970', typeKey: 'office', flag: '🇮🇹' },
  { city: 'Milano', address: 'Corso Sempione 32/B – 20154 Milano', phone: '+39 0236683102', typeKey: 'office', flag: '🇮🇹' },
  { city: 'Roma', address: 'Via Ludovisi 35 – 00187 Roma', phone: '', typeKey: 'office', flag: '🇮🇹' },
  { city: 'Moliterno', address: 'Via Amendola 170 – 85047 Moliterno (PZ)', phone: '+39 0975 668609', typeKey: 'office', flag: '🇮🇹' },
  { city: 'Bruxelles', address: 'Rue Belliard 20 – 140 – 1040 Bruxelles', phone: '+32 253724000', typeKey: 'euOffice', flag: '🇧🇪' },
];

const galleryImages: LightboxImage[] = [
  { src: '/images/photos/missions/cestari-presidente-kenya.jpg', alt: 'Incontro con il Presidente del Kenya', title: 'Kenya', description: 'Incontro istituzionale con il Presidente della Repubblica del Kenya' },
  { src: '/images/photos/missions/cestari-ministro-brasile.jpg', alt: 'Con il Ministro Brasiliano', title: 'Brasile', description: 'Partnership strategica con il governo brasiliano' },
  { src: '/images/photos/missions/congo-ministro-salute.jpg', alt: 'Missione Congo', title: 'Congo', description: 'Collaborazione con il Ministero della Salute congolese' },
  { src: '/images/photos/missions/missione-africa.jpg', alt: 'Missione Africa', title: 'Africa', description: 'Progetti di cooperazione internazionale nel continente africano' },
  { src: '/images/photos/events/cop30-brasile-01.jpg', alt: 'China Pavilion', title: 'China Pavilion', description: 'Partecipazione al China Pavilion durante eventi internazionali sul clima' },
  { src: '/images/photos/events/gala-eccellenze-01.jpg', alt: 'Evento Istituzionale', title: 'Evento Istituzionale', description: 'Incontro con rappresentanti istituzionali e partner internazionali' },
  { src: '/images/photos/founder/cestari-eccellenze.jpg', alt: 'Eccellenze Aperte', title: 'Eccellenze Aperte', description: 'Evento Eccellenze Aperte con leader del settore' },
  { src: '/images/photos/missions/africa-team.jpg', alt: 'Team Africa', title: 'Team Africa', description: 'Il nostro team operativo nel continente africano' },
];

export function ChiSiamoClient() {
  const t = useTranslations('about');
  const { openLightbox, LightboxComponent } = useLightbox(galleryImages);


  return (
    <div className="min-h-screen">
      {/* Hero Section - altezza ridotta su mobile per vedere meglio l'immagine */}
      <section className="relative min-h-[70vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/photos/chi-siamo-bg.jpg"
            alt="Gruppo Cestari"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0a1628]/70 to-[#0a1628]/60" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                {t('hero.badge')}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                {t('hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-emerald-400">{t('hero.titleHighlight')}</span>
              </h1>

              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                {t('hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About the Founder */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge-primary mb-4">
                <Building2 className="w-4 h-4" />
                {t('founder.badge')}
              </span>
              <h2 className="text-slate-800 mb-6">
                {t('founder.name')} <span className="text-primary">{t('founder.surname')}</span>
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: t.raw('founder.paragraph1') }} />
                <p dangerouslySetInnerHTML={{ __html: t.raw('founder.paragraph2') }} />
                <p dangerouslySetInnerHTML={{ __html: t.raw('founder.paragraph3') }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/photos/founder/ing-cestari-ufficio.jpg"
                  alt="Ing. Alfredo Carmine Cestari - Fondatore Gruppo Cestari"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 left-2 sm:-bottom-6 sm:left-4 lg:-left-6 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm sm:text-base">{t('founder.award')}</div>
                    <div className="text-[10px] sm:text-xs text-slate-600">{t('founder.awardSubtitle')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl text-slate-800 mb-4">{t('mission.title')}</h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('mission.description')}
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-secondary/30">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl text-slate-800 mb-4">{t('vision.title')}</h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('vision.description')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-secondary mb-4">{t('values.badge')}</span>
            <h2 className="text-slate-800 mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('values.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueKeys.map((value, index) => (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {t(`values.items.${value.key}.title`)}
                </h3>
                <p className="text-slate-600 text-sm">
                  {t(`values.items.${value.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-primary mb-4">{t('timeline.badge')}</span>
            <h2 className="text-slate-800 mb-4">
              {t('timeline.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('timeline.subtitle')}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestoneKeys.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8"
              >
                <div className="shrink-0 w-14 sm:w-20 text-right">
                  <span className="text-lg sm:text-2xl font-bold text-primary">{t(`timeline.milestones.${key}.year`)}</span>
                </div>
                <div className="relative">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'} border-2 sm:border-4 border-white shadow-lg mt-1 sm:mt-0`} />
                  {index !== milestoneKeys.length - 1 && (
                    <div className="absolute top-3 sm:top-4 left-1 sm:left-1.5 w-1 h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] bg-gradient-to-b from-primary/30 to-secondary/30" />
                  )}
                </div>
                <div className="flex-1 pb-4 sm:pb-8">
                  <div className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${index % 2 === 0 ? 'border-primary/20 hover:border-primary/40' : 'border-secondary/20 hover:border-secondary/40'} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                    <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base">{t(`timeline.milestones.${key}.title`)}</h3>
                    <p className="text-xs sm:text-sm text-slate-600">{t(`timeline.milestones.${key}.description`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-primary mb-4">
              <MapPin className="w-4 h-4" />
              {t('offices.badge')}
            </span>
            <h2 className="text-slate-800 mb-4">
              {t('offices.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('offices.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`group p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                  office.typeKey === 'headquarters'
                    ? 'bg-gradient-to-br from-primary to-blue-700 text-white shadow-xl shadow-primary/30'
                    : office.typeKey === 'euOffice'
                    ? 'bg-white/80 border-2 border-secondary/30 shadow-lg hover:shadow-xl hover:border-secondary/50'
                    : 'bg-white/80 border border-slate-200 shadow-lg hover:shadow-xl hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    office.typeKey === 'headquarters'
                      ? 'bg-white/20'
                      : office.typeKey === 'euOffice'
                      ? 'bg-secondary/10'
                      : 'bg-primary/10'
                  }`}>
                    {office.typeKey === 'headquarters' ? (
                      <Building2 className="w-6 h-6 text-white" />
                    ) : office.typeKey === 'euOffice' ? (
                      <Globe className="w-6 h-6 text-secondary" />
                    ) : (
                      <MapPin className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{office.flag}</span>
                      <div className={`font-semibold text-lg ${office.typeKey === 'headquarters' ? 'text-white' : 'text-slate-800'}`}>
                        {office.city}
                      </div>
                    </div>
                    <div className={`text-sm mb-3 ${office.typeKey === 'headquarters' ? 'text-white/90' : 'text-slate-600'}`}>
                      {office.address}
                    </div>
                    {office.phone && (
                      <a
                        href={`tel:${office.phone.replace(/\s/g, '')}`}
                        className={`inline-flex items-center gap-2 text-sm font-medium transition-all ${
                          office.typeKey === 'headquarters'
                            ? 'text-white hover:text-white/90'
                            : 'text-primary hover:text-primary/80'
                        }`}
                      >
                        {office.phone}
                      </a>
                    )}
                  </div>
                </div>
                {office.typeKey === 'headquarters' && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white uppercase tracking-wider">
                      <Building2 className="w-3 h-3" />
                      {t('offices.headquarters')}
                    </span>
                  </div>
                )}
                {office.typeKey === 'euOffice' && (
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-xs font-semibold text-secondary uppercase tracking-wider">
                      <Globe className="w-3 h-3" />
                      Hub Europeo
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Gallery - I Nostri Risultati */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              {t('performance.badge')}
            </span>
            <h2 className="text-white mb-4">
              {t('performance.title')}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('performance.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video 1 - TGCom24 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300">
                <YouTubePlayer
                  videoId="eZH6oTZXews"
                  title="Intervista TGCom24 - Ing. Cestari"
                  showControls
                  thumbnailQuality="hqdefault"
                />
                <div className="absolute top-3 left-3 z-40 pointer-events-none">
                  <span className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                    TGCom24
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-primary transition-colors">
                Intervista TGCom24
              </h3>
              <p className="text-white/70">L&apos;Ing. Cestari ospite del telegiornale nazionale</p>
            </motion.div>

            {/* Video 2 - Rai News 24 Ecofilm Fest */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 ring-1 ring-white/10 group-hover:ring-red-500/50 transition-all duration-300">
                <YouTubePlayer
                  videoId="v-Bhh23qfG0"
                  title="Rai News 24 - Ecofilm Fest"
                  showControls
                  thumbnailQuality="hqdefault"
                />
                <div className="absolute top-3 left-3 z-40 pointer-events-none">
                  <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                    Rai News 24
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-red-400 transition-colors">
                Rai News 24 - Ecofilm Fest
              </h3>
              <p className="text-white/70">Alfredo Cestari a Mensa: pace fra i popoli</p>
            </motion.div>

            {/* Video 3 - Missione Brasile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 ring-1 ring-white/10 group-hover:ring-secondary/50 transition-all duration-300">
                <YouTubePlayer
                  videoId="ihI2R_CpXiA"
                  title="Missione Brasile - Gruppo Cestari"
                  showControls
                  thumbnailQuality="hqdefault"
                />
                <div className="absolute top-3 left-3 z-40 pointer-events-none">
                  <span className="px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-full shadow-lg">
                    Brasile
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-secondary transition-colors">
                Missione Brasile
              </h3>
              <p className="text-white/70">Le nostre attività in Sud America</p>
            </motion.div>

            {/* Video 4 - Cestari e Mercatorum */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300">
                <YouTubePlayer
                  videoId="ddYRnvGEKvo"
                  title="Ing. Alfredo C. Cestari - Intervista Mercatorum"
                  showControls
                  thumbnailQuality="hqdefault"
                />
                <div className="absolute top-3 left-3 z-40 pointer-events-none">
                  <span className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                    Mercatorum
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-primary transition-colors">
                Ing. Alfredo C. Cestari
              </h3>
              <p className="text-white/70">&quot;Nella vita bisogna avere coraggio: per un&apos;impresa è ancora più importante del credito&quot;</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Photo Gallery - International Missions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-secondary mb-4">
              <Globe className="w-4 h-4" />
              {t('gallery.badge')}
            </span>
            <h2 className="text-slate-800 mb-4">
              {t('gallery.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">{photo.alt}</span>
                  <Expand className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <LightboxComponent />
    </div>
  );
}
