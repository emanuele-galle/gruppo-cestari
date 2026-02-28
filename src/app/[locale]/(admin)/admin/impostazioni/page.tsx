'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  Mail,
  Search as SearchIcon,
  Link as LinkIcon,
  Save,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Upload,
  Image,
  FileText,
  RefreshCw,
  Server,
  Shield,
  Loader2,
  AlertCircle,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  BarChart3,
  Tag,
  Send,
  Youtube,
  ShieldAlert,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
} from '@/components/admin';
import { trpc } from '@/lib/trpc';

const tabs = [
  { key: 'general', icon: Settings, label: 'Generali', description: 'Informazioni base del sito' },
  { key: 'seo', icon: SearchIcon, label: 'SEO', description: 'Ottimizzazione motori di ricerca' },
  { key: 'email', icon: Mail, label: 'Email', description: 'Configurazione SMTP' },
  { key: 'integrations', icon: LinkIcon, label: 'Integrazioni', description: 'Servizi esterni' },
];

// Default settings structure
const defaultSettings = {
  // General
  siteName: 'Gruppo Cestari',
  siteDescription: 'Holding multisettoriale specializzata in consulenza finanziaria, cooperazione internazionale ed energie rinnovabili.',
  contactEmail: 'info@gruppocestari.com',
  supportPhone: '+39 06 12345678',
  address: 'Via Roma 123, 00100 Roma, Italia',
  // Social
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  // SEO
  metaTitle: 'Gruppo Cestari - Consulenza Finanziaria e Cooperazione Internazionale',
  metaDescription: 'Holding multisettoriale specializzata in consulenza finanziaria, cooperazione internazionale ed energie rinnovabili. Oltre 40 anni di esperienza.',
  ogImage: '/images/og-image.jpg',
  // Email
  smtpHost: 'smtp.hostinger.com',
  smtpPort: '465',
  smtpUser: 'noreply@gruppocestari.com',
  fromName: 'Gruppo Cestari',
  fromEmail: 'noreply@gruppocestari.com',
  // Integrations
  googleAnalytics: '',
  googleTagManager: '',
  facebookPixel: '',
  recaptchaSiteKey: '',
};

// Category mapping for settings
const settingCategories: Record<string, string> = {
  siteName: 'general',
  siteDescription: 'general',
  contactEmail: 'general',
  supportPhone: 'general',
  address: 'general',
  facebook: 'social',
  twitter: 'social',
  linkedin: 'social',
  instagram: 'social',
  youtube: 'social',
  metaTitle: 'seo',
  metaDescription: 'seo',
  ogImage: 'seo',
  smtpHost: 'email',
  smtpPort: 'email',
  smtpUser: 'email',
  fromName: 'email',
  fromEmail: 'email',
  googleAnalytics: 'integrations',
  googleTagManager: 'integrations',
  facebookPixel: 'integrations',
  recaptchaSiteKey: 'integrations',
};

type SettingsData = typeof defaultSettings;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

// eslint-disable-next-line sonarjs/cognitive-complexity -- complex settings form logic
export default function AdminImpostazioniPage() {
  const t = useTranslations('admin.settings');
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Fetch settings using tRPC (protected by superadminProcedure)
  const {
    data: settingsData,
    isLoading: loading,
    error: queryError,
  } = trpc.admin.settings.getAll.useQuery(undefined, {
    enabled: sessionStatus === 'authenticated' && ['ADMIN', 'SUPERADMIN'].includes(session?.user?.role || ''),
  });

  // Update mutation
  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Errore nel salvataggio');
    },
  });

  const saving = updateMutation.isPending;

  // Transform API response to flat settings object when data loads
  useEffect(() => {
    if (settingsData?.data) {
      const loadedSettings = { ...defaultSettings };
      Object.entries(settingsData.data).forEach(([key, data]) => {
        if (key in loadedSettings) {
          const settingData = data as { value: unknown; category: string | null };
          loadedSettings[key as keyof SettingsData] = String(settingData.value ?? '');
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync settings from API data
      setSettings(loadedSettings);
    }
  }, [settingsData]);

  // Set error from query
  useEffect(() => {
    if (queryError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync settings from API data
      setError(queryError.message || 'Errore nel caricamento delle impostazioni');
    }
  }, [queryError]);

  const handleSave = () => {
    setError(null);

    // Transform flat settings to API format
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value,
      category: settingCategories[key] || null,
    }));

    updateMutation.mutate({ settings: settingsArray });
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Role-based access control: Only ADMIN and SUPERADMIN can access this page
  const userRole = session?.user?.role;
  const hasAccess = userRole && ['ADMIN', 'SUPERADMIN'].includes(userRole);

  // Show loading while checking session
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-slate-500">Caricamento impostazioni...</span>
        </div>
      </div>
    );
  }

  // Access denied for EDITOR role
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Accesso Negato</h2>
            <p className="text-slate-500">
              Non hai i permessi per accedere alle impostazioni.
              Solo gli amministratori possono modificare la configurazione del sito.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          badge={{ label: 'Configurazione', variant: 'purple' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-primary/25 hover:shadow-primary/40'
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Salvataggio...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Salvato!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('save')}
              </>
            )}
          </motion.button>
        </PageHeader>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="sticky top-24">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.key}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.key
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.key ? 'bg-primary/20' : 'bg-slate-100'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-medium ${activeTab === tab.key ? 'text-primary' : ''}`}>
                          {t(`tabs.${tab.key}`)}
                        </p>
                        <p className="text-xs text-slate-500/70 mt-0.5">{tab.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Site Info */}
                <Card variant="bordered">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-slate-800">Informazioni Sito</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('general.siteName')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('general.contactEmail')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                            <Mail className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="email"
                            value={settings.contactEmail}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800/80 mb-2">
                        {t('general.siteDescription')}
                      </label>
                      <textarea
                        rows={3}
                        value={settings.siteDescription}
                        onChange={(e) => handleChange('siteDescription', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('general.supportPhone')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                            <Phone className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="tel"
                            value={settings.supportPhone}
                            onChange={(e) => handleChange('supportPhone', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('general.address')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="text"
                            value={settings.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card variant="bordered">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-slate-800">{t('general.socialLinks')}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'facebook', icon: Facebook, color: 'blue-600', placeholder: 'https://facebook.com/...' },
                        { key: 'twitter', icon: Twitter, color: 'sky-500', placeholder: 'https://twitter.com/...' },
                        { key: 'linkedin', icon: Linkedin, color: 'blue-700', placeholder: 'https://linkedin.com/company/...' },
                        { key: 'instagram', icon: Instagram, color: 'pink-500', placeholder: 'https://instagram.com/...' },
                        { key: 'youtube', icon: Youtube, color: 'red-500', placeholder: 'https://youtube.com/@...' },
                      ].map((social) => {
                        const Icon = social.icon;
                        return (
                          <div key={social.key} className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl bg-${social.color}/20 flex items-center justify-center shrink-0 border border-${social.color}/20`}>
                              <Icon className={`w-5 h-5 text-${social.color.replace('-600', '-400').replace('-700', '-500').replace('-500', '-400')}`} />
                            </div>
                            <input
                              type="url"
                              value={settings[social.key as keyof SettingsData]}
                              onChange={(e) => handleChange(social.key, e.target.value)}
                              placeholder={social.placeholder}
                              className="flex-1 px-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SEO Settings */}
            {activeTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card variant="bordered">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-slate-800">Meta Tags</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-800/80 mb-2">
                        {t('seo.metaTitle')}
                      </label>
                      <input
                        type="text"
                        value={settings.metaTitle}
                        onChange={(e) => handleChange('metaTitle', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          {settings.metaTitle.length}/60 caratteri consigliati
                        </p>
                        <StatusBadge
                          variant={settings.metaTitle.length <= 60 ? 'success' : 'warning'}
                          size="sm"
                        >
                          {settings.metaTitle.length <= 60 ? 'Ottimo' : 'Troppo lungo'}
                        </StatusBadge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800/80 mb-2">
                        {t('seo.metaDescription')}
                      </label>
                      <textarea
                        rows={3}
                        value={settings.metaDescription}
                        onChange={(e) => handleChange('metaDescription', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          {settings.metaDescription.length}/160 caratteri consigliati
                        </p>
                        <StatusBadge
                          variant={settings.metaDescription.length <= 160 ? 'success' : 'warning'}
                          size="sm"
                        >
                          {settings.metaDescription.length <= 160 ? 'Ottimo' : 'Troppo lungo'}
                        </StatusBadge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800/80 mb-2">
                        {t('seo.ogImage')}
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-24 bg-slate-100/50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                          {settings.ogImage ? (
                            <img src={settings.ogImage} alt="OG" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-8 h-8 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-100/80 border border-slate-200 transition-all">
                            <Upload className="w-4 h-4" />
                            Carica Immagine
                          </button>
                          <p className="text-xs text-slate-500 mt-2">
                            Dimensioni consigliate: 1200x630px
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{t('seo.robotsTxt')}</h4>
                        <button className="text-sm text-primary hover:underline mt-1">
                          Modifica robots.txt
                        </button>
                      </div>
                    </div>
                  </Card>
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl">
                        <Globe className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{t('seo.sitemap')}</h4>
                        <button className="text-sm text-primary hover:underline mt-1">
                          Rigenera sitemap
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card variant="bordered">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-slate-800">Configurazione SMTP</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('email.smtpHost')}
                        </label>
                        <input
                          type="text"
                          value={settings.smtpHost}
                          onChange={(e) => handleChange('smtpHost', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('email.smtpPort')}
                        </label>
                        <input
                          type="text"
                          value={settings.smtpPort}
                          onChange={(e) => handleChange('smtpPort', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800/80 mb-2">
                        {t('email.smtpUser')}
                      </label>
                      <input
                        type="text"
                        value={settings.smtpUser}
                        onChange={(e) => handleChange('smtpUser', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('email.fromName')}
                        </label>
                        <input
                          type="text"
                          value={settings.fromName}
                          onChange={(e) => handleChange('fromName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800/80 mb-2">
                          {t('email.fromEmail')}
                        </label>
                        <input
                          type="email"
                          value={settings.fromEmail}
                          onChange={(e) => handleChange('fromEmail', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                        <Send className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Test Configurazione</h4>
                        <p className="text-sm text-slate-500">Invia un&apos;email di test per verificare le impostazioni</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-100/80 border border-slate-200 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      Invia Test
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Google Analytics */}
                <Card variant="bordered">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <BarChart3 className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">Google Analytics 4</h4>
                          <StatusBadge variant={settings.googleAnalytics ? 'success' : 'default'} size="sm">
                            {settings.googleAnalytics ? 'Attivo' : 'Non configurato'}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Tracciamento visite e comportamento utenti</p>
                        <input
                          type="text"
                          value={settings.googleAnalytics}
                          onChange={(e) => handleChange('googleAnalytics', e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full px-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tag Manager */}
                <Card variant="bordered">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <Tag className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">Google Tag Manager</h4>
                          <StatusBadge variant={settings.googleTagManager ? 'success' : 'default'} size="sm">
                            {settings.googleTagManager ? 'Attivo' : 'Non configurato'}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Gestione centralizzata dei tag</p>
                        <input
                          type="text"
                          value={settings.googleTagManager}
                          onChange={(e) => handleChange('googleTagManager', e.target.value)}
                          placeholder="GTM-XXXXXXX"
                          className="w-full px-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* reCAPTCHA */}
                <Card variant="bordered">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">Google reCAPTCHA v3</h4>
                          <StatusBadge variant={settings.recaptchaSiteKey ? 'success' : 'default'} size="sm">
                            {settings.recaptchaSiteKey ? 'Attivo' : 'Non configurato'}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Protezione form da spam e bot</p>
                        <input
                          type="text"
                          value={settings.recaptchaSiteKey}
                          onChange={(e) => handleChange('recaptchaSiteKey', e.target.value)}
                          placeholder="Site Key"
                          className="w-full px-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Facebook Pixel */}
                <Card variant="bordered">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-600/20">
                        <Facebook className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">Facebook Pixel</h4>
                          <StatusBadge variant={settings.facebookPixel ? 'success' : 'default'} size="sm">
                            {settings.facebookPixel ? 'Attivo' : 'Non configurato'}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Tracciamento conversioni Facebook Ads</p>
                        <input
                          type="text"
                          value={settings.facebookPixel}
                          onChange={(e) => handleChange('facebookPixel', e.target.value)}
                          placeholder="Pixel ID"
                          className="w-full px-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
