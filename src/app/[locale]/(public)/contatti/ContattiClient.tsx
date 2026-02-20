'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  Loader2,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  AlertCircle,
  Globe,
  Users,
  Sparkles,
  MessageSquare,
  Map,
} from 'lucide-react';
import { OfficesMap } from '@/components/ui/offices-map';
import { Turnstile } from '@/components/ui/turnstile';

const offices = [
  {
    city: 'Salerno',
    type: 'headquarters',
    address: 'Via Don Minzoni, 1 – 84084 Fisciano (SA)',
    phone: '+39 089 952889',
    email: 'info@gruppocestari.com',
    isHQ: true,
    flag: '🇮🇹',
  },
  {
    city: 'Napoli',
    type: 'office',
    address: 'Centro Direzionale Isola A5 – 80143 Napoli (NA)',
    phone: '+39 081 7875970',
    email: 'napoli@gruppocestari.com',
    flag: '🇮🇹',
  },
  {
    city: 'Milano',
    type: 'office',
    address: 'Corso Sempione 32/B – 20154 Milano',
    phone: '+39 0236683102',
    email: 'milano@gruppocestari.com',
    flag: '🇮🇹',
  },
  {
    city: 'Roma',
    type: 'institutional',
    address: 'Via Ludovisi 35 – 00187 Roma',
    phone: '',
    email: 'roma@gruppocestari.com',
    flag: '🇮🇹',
  },
  {
    city: 'Moliterno',
    type: 'office',
    address: 'Via Amendola 170 – 85047 Moliterno (PZ)',
    phone: '+39 0975 668609',
    email: 'moliterno@gruppocestari.com',
    flag: '🇮🇹',
  },
  {
    city: 'Bruxelles',
    type: 'euAffairs',
    address: 'Rue Belliard 20 – 140 – 1040 Bruxelles',
    phone: '+32 253724000',
    email: 'brussels@gruppocestari.com',
    flag: '🇧🇪',
  },
];

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socialLinks = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/gruppo-cestari-599423266/', icon: Linkedin, color: 'hover:bg-[#0077B5]' },
  { name: 'Facebook', href: 'https://www.facebook.com/cestarigroup/?locale=it_IT', icon: Facebook, color: 'hover:bg-[#1877F2]' },
  { name: 'Instagram', href: 'https://www.instagram.com/cestari.group/', icon: Instagram, color: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]' },
  { name: 'YouTube', href: 'https://www.youtube.com/@CestariGroup', icon: Youtube, color: 'hover:bg-[#FF0000]' },
  { name: 'X', href: 'https://x.com/CestariGruppo', icon: XIcon, color: 'hover:bg-black' },
];

interface FormErrors {
  [key: string]: string;
}

export function ContattiClient() {
  const t = useTranslations('contact');
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const officesRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isFormInView = useInView(formRef, { once: true, margin: '-50px' });
  const isOfficesInView = useInView(officesRef, { once: true, margin: '-50px' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const subjectOptions = [
    { value: '', label: t('form.subjects.default') },
    { value: 'info', label: t('form.subjects.info') },
    { value: 'consulting', label: t('form.subjects.consulting') },
    { value: 'partnership', label: t('form.subjects.partnership') },
    { value: 'energy', label: t('form.subjects.energy') },
    { value: 'eu-grants', label: t('form.subjects.euGrants') },
    { value: 'career', label: t('form.subjects.career') },
    { value: 'other', label: t('form.subjects.other') },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Check Turnstile token (only if Turnstile is enabled)
    const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (turnstileEnabled && !turnstileToken) {
      setError(t('form.captchaRequired') || 'Completa la verifica di sicurezza');
      setIsSubmitting(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      company: formData.get('company') as string || undefined,
      subject: formData.get('subject') as string || undefined,
      message: formData.get('message') as string,
      privacyAccepted: formData.get('privacy') === 'on',
      // Honeypot field - should be empty
      website: formData.get('website') as string || undefined,
      // Turnstile token for server verification
      turnstileToken: turnstileToken || undefined,
    };

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          const errors: FormErrors = {};
          result.errors.forEach((err: { field: string; message: string }) => {
            errors[err.field] = err.message;
          });
          setFieldErrors(errors);
        }
        throw new Error(result.message || t('form.error'));
      }

      setIsSubmitted(true);
      setTurnstileToken(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cinematic */}
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

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
            >
              <MessageSquare className="w-4 h-4" />
              {t('quickContact.badge')}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {t('hero.title').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-primary-light to-secondary bg-clip-text text-transparent">
                {t('hero.title').split(' ').slice(-1)}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/70 leading-relaxed mb-12 max-w-2xl mx-auto"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Quick Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              <motion.a
                href="tel:+39089952889"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="relative text-left">
                  <div className="text-xs text-white/50 uppercase tracking-wider">{t('quickContact.phoneLabel')}</div>
                  <div className="text-white font-semibold">+39 089 952889</div>
                </div>
              </motion.a>

              <motion.a
                href="mailto:info@gruppocestari.com"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="relative text-left">
                  <div className="text-xs text-white/50 uppercase tracking-wider">{t('quickContact.emailLabel')}</div>
                  <div className="text-white font-semibold text-sm">info@gruppocestari.com</div>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="relative text-left">
                  <div className="text-xs text-white/50 uppercase tracking-wider">{t('quickContact.hoursLabel')}</div>
                  <div className="text-white font-semibold">{t('quickContact.hoursValue')}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section ref={formRef} className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isFormInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3"
            >
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-secondary/10 to-emerald-500/10 rounded-3xl blur-2xl" />

                <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                  {/* Form header */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                        {t('form.title')}
                      </h2>
                      <p className="text-slate-500">
                        {t('form.description')}
                      </p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      role="status"
                      aria-live="polite"
                      className="text-center py-16"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary/30"
                      >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        {t('form.success.title')}
                      </h3>
                      <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                        {t('form.success.message')}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSubmitted(false)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl transition-shadow"
                      >
                        {t('form.success.button')}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot field - hidden from users, visible to bots */}
                      <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                        <label htmlFor="website" className="sr-only">Leave this field empty</label>
                        <input
                          type="text"
                          id="website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          role="alert"
                          aria-live="polite"
                          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                        >
                          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                          <span className="text-sm">{error}</span>
                        </motion.div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="group">
                          <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('form.name')} <span className="text-primary" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            required
                            aria-required="true"
                            aria-invalid={!!fieldErrors.name}
                            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                            className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-0 focus:bg-white focus:border-primary transition-all ${
                              fieldErrors.name ? 'border-red-300' : 'border-slate-100 group-hover:border-slate-200'
                            }`}
                            placeholder={t('form.namePlaceholder')}
                          />
                        </div>
                        <div className="group">
                          <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('form.surname')} <span className="text-primary" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            required
                            aria-required="true"
                            aria-invalid={!!fieldErrors.name}
                            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:bg-white focus:border-primary group-hover:border-slate-200 transition-all"
                            placeholder={t('form.surnamePlaceholder')}
                          />
                          {fieldErrors.name && (
                            <p id="name-error" role="alert" className="text-red-500 text-xs mt-2">{fieldErrors.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="group">
                          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('form.email')} <span className="text-primary" aria-hidden="true">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            aria-required="true"
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                            autoComplete="email"
                            className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-0 focus:bg-white focus:border-primary transition-all ${
                              fieldErrors.email ? 'border-red-300' : 'border-slate-100 group-hover:border-slate-200'
                            }`}
                            placeholder={t('form.emailPlaceholder')}
                          />
                          {fieldErrors.email && (
                            <p id="email-error" role="alert" className="text-red-500 text-xs mt-2">{fieldErrors.email}</p>
                          )}
                        </div>
                        <div className="group">
                          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('form.phone')}
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            autoComplete="tel"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:bg-white focus:border-primary group-hover:border-slate-200 transition-all"
                            placeholder={t('form.phonePlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('form.company')}
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          autoComplete="organization"
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:bg-white focus:border-primary group-hover:border-slate-200 transition-all"
                          placeholder={t('form.companyPlaceholder')}
                        />
                      </div>

                      <div className="group">
                        <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('form.subject')} <span className="text-primary" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          aria-required="true"
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:bg-white focus:border-primary group-hover:border-slate-200 transition-all appearance-none cursor-pointer"
                        >
                          {subjectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="group">
                        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('form.message')} <span className="text-primary" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.message}
                          aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                          rows={5}
                          className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-0 focus:bg-white focus:border-primary transition-all resize-none ${
                            fieldErrors.message ? 'border-red-300' : 'border-slate-100 group-hover:border-slate-200'
                          }`}
                          placeholder={t('form.messagePlaceholder')}
                        />
                        {fieldErrors.message && (
                          <p id="message-error" role="alert" className="text-red-500 text-xs mt-2">{fieldErrors.message}</p>
                        )}
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <input
                          type="checkbox"
                          name="privacy"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.privacyAccepted}
                          aria-describedby={fieldErrors.privacyAccepted ? 'privacy-error' : undefined}
                          id="privacy"
                          className="mt-1 w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="privacy" className="text-sm text-slate-600 cursor-pointer">
                          {t('form.privacy')}{' '}
                          <Link href="/privacy" className="text-primary font-medium hover:underline">
                            {t('form.privacyLink')}
                          </Link>{' '}
                          {t('form.privacyEnd')}
                        </label>
                      </div>
                      {fieldErrors.privacyAccepted && (
                        <p id="privacy-error" role="alert" className="text-red-500 text-xs">{fieldErrors.privacyAccepted}</p>
                      )}

                      {/* Cloudflare Turnstile - Anti-bot protection */}
                      <Turnstile
                        onVerify={(token) => setTurnstileToken(token)}
                        onExpire={() => setTurnstileToken(null)}
                        onError={() => setTurnstileToken(null)}
                        theme="light"
                        className="flex justify-center"
                      />

                      <motion.button
                        type="submit"
                        disabled={isSubmitting || (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('form.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {t('form.submit')}
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isFormInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Why contact us */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 p-8 text-white">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">
                      {t('sidebar.whyTitle')}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      t('sidebar.reasons.consultation'),
                      t('sidebar.reasons.response'),
                      t('sidebar.reasons.team'),
                      t('sidebar.reasons.presence'),
                    ].map((item, idx) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: 20 }}
                        animate={isFormInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-white/90">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Social */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-5">
                  {t('sidebar.followTitle')}
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, idx) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isFormInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-600 hover:text-white ${social.color} transition-all`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section ref={officesRef} className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isOfficesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isOfficesInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6"
            >
              <Building2 className="w-4 h-4" />
              {t('offices.badge')}
            </motion.div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-4">
              {t('offices.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('offices.subtitle')}
            </p>
          </motion.div>

          {/* Office Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }}
                animate={isOfficesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className={`relative group rounded-3xl p-6 transition-all duration-300 ${
                  office.isHQ
                    ? 'bg-gradient-to-br from-primary via-primary to-blue-700 text-white shadow-xl shadow-primary/30'
                    : 'bg-white border border-slate-200 hover:border-primary/30 hover:shadow-xl'
                }`}
              >
                {/* HQ Glow */}
                {office.isHQ && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                )}

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{office.flag}</span>
                      <div>
                        <h3 className={`text-xl font-bold ${office.isHQ ? 'text-white' : 'text-slate-800'}`}>
                          {office.city}
                        </h3>
                        {office.isHQ && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold mt-1">
                            {t('offices.hqBadge')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <p className={`text-sm mb-5 ${office.isHQ ? 'text-white/70' : 'text-slate-500'}`}>
                    {t(`offices.types.${office.type}`)}
                  </p>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className={`flex items-start gap-3 ${office.isHQ ? 'text-white/90' : 'text-slate-600'}`}>
                      <MapPin className="w-4 h-4 shrink-0 mt-1" />
                      <span className="text-sm">{office.address}</span>
                    </div>
                    {office.phone && (
                      <a
                        href={`tel:${office.phone.replace(/\s/g, '')}`}
                        className={`flex items-center gap-3 text-sm transition-colors ${
                          office.isHQ ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-primary'
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        {office.phone}
                      </a>
                    )}
                    <a
                      href={`mailto:${office.email}`}
                      className={`flex items-center gap-3 text-sm transition-colors ${
                        office.isHQ ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-primary'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      {office.email}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isOfficesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('map.placeholder')}</h3>
                <p className="text-sm text-slate-500">{t('map.openMaps')}</p>
              </div>
            </div>
            <OfficesMap />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-primary via-blue-600 to-primary overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{t('finalCta.title')}</h3>
              <p className="text-white/70">{t('finalCta.subtitle')}</p>
            </motion.div>
            <motion.a
              href="tel:+39089952889"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-primary font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              {t('finalCta.button')}
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
