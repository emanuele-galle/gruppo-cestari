'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Calendar,
  Euro,
  Clock,
  ArrowRight,
  Search,
  FileText,
  Globe,
  Target,
  X,
  Filter,
  TrendingUp,
  Building2,
  Landmark,
  Flag,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc';
import { BandoType } from '@/generated/prisma';
import { Skeleton } from '@/components/ui/skeleton';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  EUROPEAN: <Flag className="w-3.5 h-3.5" />,
  NATIONAL: <Landmark className="w-3.5 h-3.5" />,
  REGIONAL: <Building2 className="w-3.5 h-3.5" />,
  PRIVATE: <Target className="w-3.5 h-3.5" />,
};

const TYPE_KEYS = ['all', 'EUROPEAN', 'NATIONAL', 'REGIONAL', 'PRIVATE'] as const;
const SECTOR_KEYS = ['all', 'ENERGY', 'ENVIRONMENT', 'INNOVATION', 'AGRICULTURE', 'INFRASTRUCTURE', 'DIGITAL', 'HEALTH', 'EDUCATION', 'TOURISM', 'COOPERATION', 'RENEWABLE_ENERGY', 'DEVELOPMENT'] as const;
const STATUS_KEYS = ['all', 'open', 'upcoming'] as const;

// Skeleton card component
function BandoSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="flex gap-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="lg:text-right space-y-2">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-6 w-32 ml-auto" />
          <Skeleton className="h-5 w-24 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Countdown progress component
function CountdownProgress({ daysRemaining, daysRemainingLabel }: { daysRemaining: number; daysRemainingLabel: string }) {
  const totalDays = 90;
  const progress = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));

  let colorClass = 'bg-green-500';
  let textClass = 'text-green-600';
  let bgClass = 'bg-green-50';
  if (daysRemaining <= 7) {
    colorClass = 'bg-red-500';
    textClass = 'text-red-600';
    bgClass = 'bg-red-50';
  } else if (daysRemaining <= 30) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-600';
    bgClass = 'bg-amber-50';
  }

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
        <Clock className="w-3 h-3" />
        {daysRemaining} {daysRemainingLabel}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colorClass} rounded-full`}
        />
      </div>
    </div>
  );
}

// Stats card component
function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} rounded-2xl p-5 text-center`}
    >
      <Icon className="w-6 h-6 mx-auto mb-2 opacity-80" />
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </motion.div>
  );
}

// Featured bando card
function FeaturedBandoCard({ bando, translation, formatCurrency, getStatusInfo, getDaysRemaining, translations, locale }: {
  bando: any;
  translation: any;
  formatCurrency: (amount: number | null) => string;
  getStatusInfo: (openDate: Date, closeDate: Date | null, untilFundsExhausted?: boolean) => { label: string; color: string };
  getDaysRemaining: (closeDate: Date | null, untilFundsExhausted?: boolean) => number | null;
  translations: { featured: string; deadline: string; typeLabel: string };
  locale: string;
}) {
  const statusInfo = getStatusInfo(bando.openDate, bando.closeDate, bando.untilFundsExhausted);
  const daysRemaining = getDaysRemaining(bando.closeDate, bando.untilFundsExhausted);

  return (
    <Link href={`/bandi/${bando.code}`}>
      <motion.div
        whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
        className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white h-full group overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              {translations.featured}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:underline decoration-2 underline-offset-4">
            {translation?.title ?? 'Bando'}
          </h3>

          {/* Summary */}
          <p className="text-white/80 text-sm mb-4 line-clamp-2">
            {translation?.summary ?? ''}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div className="flex items-center gap-1.5">
              <Euro className="w-4 h-4 opacity-70" />
              <span className="font-semibold">{formatCurrency(bando.fundingAmount ? Number(bando.fundingAmount) : null)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {TYPE_ICONS[bando.type]}
              <span>{translations.typeLabel}</span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="text-sm">
              <span className="opacity-70">{translations.deadline}: </span>
              <span className="font-medium">
                {bando.untilFundsExhausted
                  ? 'Fino a esaurimento fondi'
                  : bando.closeDate
                    ? new Date(bando.closeDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'
                }
              </span>
            </div>
            {daysRemaining !== null && daysRemaining <= 30 && (
              <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                {daysRemaining}g
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Empty state component
function EmptyState({ hasFilters, onClearFilters, translations }: {
  hasFilters: boolean;
  onClearFilters: () => void;
  translations: { noResults: string; noResultsMessage: string; noResultsEmpty: string; removeAll: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
        <FileText className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {translations.noResults}
      </h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {hasFilters
          ? translations.noResultsMessage
          : translations.noResultsEmpty}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <X className="w-4 h-4" />
          {translations.removeAll}
        </button>
      )}
    </motion.div>
  );
}

export function BandiClient() {
  const t = useTranslations('grants');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [activeType, setActiveType] = useState<string>(searchParams.get('type') || 'all');
  const [activeSector, setActiveSector] = useState<string>(searchParams.get('sector') || 'all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'open' | 'upcoming'>(
    (searchParams.get('status') as 'all' | 'open' | 'upcoming') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = activeType !== 'all' || activeSector !== 'all' || activeStatus !== 'all' || searchQuery !== '';

  // Update URL when filters change
  const updateURL = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '1' && value !== '') {
        newParams.set(key, value);
      }
    });
    const query = newParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);

  const handleFilterChange = (type: string, sector: string, status: string, query: string) => {
    setActiveType(type);
    setActiveSector(sector);
    setActiveStatus(status as 'all' | 'open' | 'upcoming');
    setSearchQuery(query);
    setPage(1);
    updateURL({ type, sector, status, q: query, page: '1' });
  };

  const clearAllFilters = () => {
    handleFilterChange('all', 'all', 'all', '');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ type: activeType, sector: activeSector, status: activeStatus, q: searchQuery, page: newPage.toString() });
  };

  const { data, isLoading, error } = trpc.bandi.listPublic.useQuery({
    page,
    limit: 12,
    type: activeType !== 'all' ? activeType as BandoType : undefined,
    status: activeStatus,
    locale,
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return t('toDefine');
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} mld`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} mln`;
    }
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusInfo = (openDate: Date, closeDate: Date | null, untilFundsExhausted?: boolean) => {
    const now = new Date();
    const open = new Date(openDate);

    if (open > now) {
      return { label: t('status.upcoming'), color: 'bg-blue-100 text-blue-700' };
    }
    // If "until funds exhausted", it's always open once started
    if (untilFundsExhausted) {
      return { label: t('status.open'), color: 'bg-green-100 text-green-700' };
    }
    if (closeDate) {
      const close = new Date(closeDate);
      if (close < now) {
        return { label: t('status.closed'), color: 'bg-red-100 text-red-700' };
      }
      const daysRemaining = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 7) {
        return { label: t('status.closing'), color: 'bg-amber-100 text-amber-700' };
      }
    }
    return { label: t('status.open'), color: 'bg-green-100 text-green-700' };
  };

  const getDaysRemaining = (closeDate: Date | null, untilFundsExhausted?: boolean) => {
    if (untilFundsExhausted || !closeDate) return null;
    const days = Math.ceil((new Date(closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  // Filter by search query and sector on client side
  // L'ordinamento viene dal server (createdAt desc = più recenti prima)
  type BandoItem = NonNullable<typeof data>['items'][number];
  const filteredBandi = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((bando: BandoItem) => {
      const translation = bando.translations[0];
      if (!translation) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          translation.title.toLowerCase().includes(query) ||
          translation.summary.toLowerCase().includes(query) ||
          bando.code.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Sector filter
      if (activeSector !== 'all' && bando.sector !== activeSector) {
        return false;
      }

      return true;
    });
  }, [data?.items, searchQuery, activeSector]);

  // Get featured bandi (first 2 with highest funding that are open)
  const featuredBandi = useMemo(() => {
    if (!data?.items) return [];
    const openLabel = t('status.open');
    const closingLabel = t('status.closing');
    return data.items
      .filter((b: BandoItem) => {
        const status = getStatusInfo(b.openDate, b.closeDate, b.untilFundsExhausted);
        return status.label === openLabel || status.label === closingLabel;
      })
      .sort((a: BandoItem, b: BandoItem) => (Number(b.fundingAmount) || 0) - (Number(a.fundingAmount) || 0))
      .slice(0, 2);
  }, [data?.items, t]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.items) return { total: 0, totalFunding: 0, expiringSoon: 0 };

    let totalFunding = 0;
    let expiringSoon = 0;

    data.items.forEach((bando: BandoItem) => {
      totalFunding += Number(bando.fundingAmount) || 0;
      const days = getDaysRemaining(bando.closeDate);
      if (days !== null && days <= 30) expiringSoon++;
    });

    return {
      total: data.pagination.total,
      totalFunding,
      expiringSoon,
    };
  }, [data]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-14 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          <motion.div
            className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/30 blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/40 blur-[100px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-cyan-500/20 blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0" y1="30%" x2="100%" y2="50%"
              stroke="url(#lineGradient1)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="100%" y1="20%" x2="0" y2="60%"
              stroke="url(#lineGradient1)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </svg>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, i % 2 === 0 ? 20 : -20, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Geometric shapes */}
          <motion.div
            className="absolute top-1/4 left-[10%] w-20 h-20 border border-white/10 rounded-lg"
            animate={{
              rotate: [0, 90, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-[15%] w-16 h-16 border border-white/10 rounded-full"
            animate={{
              rotate: [0, -180, -360],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-[60%] left-[20%] w-12 h-12 border border-secondary/20"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            animate={{
              rotate: [0, 360],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              {t('hero.badge')}
            </span>
            <h1 className="text-3xl xs:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed mb-6 sm:mb-8">
              {t('hero.subtitle')}
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(activeType, activeSector, activeStatus, e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:pl-12 sm:py-4 bg-white rounded-xl focus:ring-2 focus:ring-secondary/50 transition-all text-base sm:text-lg text-slate-800 placeholder:text-slate-400 shadow-xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-3 sm:py-4 bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg"
            >
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Filter className="w-4 h-4" />
                {t('filters.label')}
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {t('filters.active')}
                  </span>
                )}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters content */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Left filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Type Filter */}
                <select
                  value={activeType}
                  onChange={(e) => handleFilterChange(e.target.value, activeSector, activeStatus, searchQuery)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key === 'all' ? t('types.all') : t(`types.${key.toLowerCase()}s`)}
                    </option>
                  ))}
                </select>

                {/* Sector Filter */}
                <select
                  value={activeSector}
                  onChange={(e) => handleFilterChange(activeType, e.target.value, activeStatus, searchQuery)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {SECTOR_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key === 'all' ? t('filters.allSectors') : t(`sectors.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right filters */}
              <div className="flex items-center gap-3">
                {/* Status Pills */}
                <div className="flex gap-2">
                  {STATUS_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleFilterChange(activeType, activeSector, key, searchQuery)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeStatus === key
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t(`filters.statuses.${key}`)}
                    </button>
                  ))}
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('filters.clear')}
                  </button>
                )}
              </div>
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">{t('filters.activeFilters')}</span>
                {activeType !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {t(`types.${activeType}`)}
                    <button onClick={() => handleFilterChange('all', activeSector, activeStatus, searchQuery)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {activeSector !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full">
                    {t(`sectors.${activeSector}`)}
                    <button onClick={() => handleFilterChange(activeType, 'all', activeStatus, searchQuery)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {activeStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                    {t(`filters.statuses.${activeStatus}`)}
                    <button onClick={() => handleFilterChange(activeType, activeSector, 'all', searchQuery)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => handleFilterChange(activeType, activeSector, activeStatus, '')}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Bandi */}
      {!isLoading && featuredBandi.length > 0 && !hasActiveFilters && (
        <section className="py-8 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold text-slate-800">{t('featuredGrants')}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredBandi.map((bando: BandoItem) => {
                const translation = bando.translations[0];
                if (!translation) return null;
                return (
                  <FeaturedBandoCard
                    key={bando.id}
                    bando={bando}
                    translation={translation}
                    formatCurrency={formatCurrency}
                    getStatusInfo={getStatusInfo}
                    getDaysRemaining={getDaysRemaining}
                    translations={{
                      featured: t('featured'),
                      deadline: t('deadline'),
                      typeLabel: t(`types.${bando.type}`),
                    }}
                    locale={locale}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bandi List */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Results count */}
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{filteredBandi.length}</span> {t('grantsFound')}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BandoSkeleton />
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg text-slate-600">{t('loadingError')}</p>
            </div>
          ) : filteredBandi.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              translations={{
                noResults: t('noResults'),
                noResultsMessage: t('noResultsMessage'),
                noResultsEmpty: t('noResultsEmpty'),
                removeAll: t('filters.removeAll'),
              }}
            />
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredBandi.map((bando: BandoItem, index: number) => {
                  const translation = bando.translations[0];
                  if (!translation) return null;

                  const statusInfo = getStatusInfo(bando.openDate, bando.closeDate, bando.untilFundsExhausted);
                  const daysRemaining = getDaysRemaining(bando.closeDate, bando.untilFundsExhausted);

                  return (
                    <motion.div
                      key={bando.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/bandi/${bando.code}`}>
                        <motion.div
                          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' }}
                          className="bg-white rounded-xl border border-slate-200 hover:border-primary/30 transition-all p-3 sm:p-4 md:p-6 group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                            {/* Main Content */}
                            <div className="flex-1">
                              {/* Meta */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                  {TYPE_ICONS[bando.type]}
                                  {t(`types.${bando.type}`)}
                                </span>
                                {bando.sector && (
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                    {t(`sectors.${bando.sector}`)}
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-slate-50 text-xs font-mono text-slate-400 rounded">
                                  {bando.code}
                                </span>
                              </div>

                              {/* Title & Summary */}
                              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1">
                                {translation?.title ?? 'Bando'}
                              </h3>
                              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {translation?.summary ?? ''}
                              </p>

                              {/* Details */}
                              <div className="flex flex-wrap gap-5 text-sm">
                                <div className="flex items-center gap-2">
                                  <Euro className="w-4 h-4 text-primary" />
                                  <span className="text-slate-500">{t('amount')}:</span>
                                  <span className="font-semibold text-slate-800">
                                    {formatCurrency(bando.fundingAmount ? Number(bando.fundingAmount) : null)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Deadline & CTA */}
                            <div className="lg:text-right lg:min-w-[180px]">
                              <div className="mb-3">
                                <div className="flex items-center gap-2 lg:justify-end text-xs text-slate-500 mb-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {t('deadline')}
                                </div>
                                <div className="font-semibold text-slate-800">
                                  {bando.untilFundsExhausted
                                    ? 'Fino a esaurimento fondi'
                                    : bando.closeDate
                                      ? new Date(bando.closeDate).toLocaleDateString(locale, {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : '—'
                                  }
                                </div>
                                {daysRemaining !== null && (
                                  <div className="mt-3">
                                    <CountdownProgress daysRemaining={daysRemaining} daysRemainingLabel={t('daysRemaining')} />
                                  </div>
                                )}
                              </div>
                              <span className="inline-flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                                {t('viewDetails')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <motion.button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </motion.button>
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <motion.button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-medium text-sm sm:text-base transition-all touch-target ${
                    p === page
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-primary/30'
                  }`}
                >
                  {p}
                </motion.button>
              ))}
              <motion.button
                onClick={() => handlePageChange(Math.min(data.pagination.totalPages, page + 1))}
                disabled={page === data.pagination.totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/25 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Diagonal lines pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ctaDiagonalLines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaDiagonalLines)" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-secondary text-sm font-medium mb-6 border border-secondary/30">
              <Target className="w-4 h-4" />
              Consulenza gratuita
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consulenza"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg w-full sm:w-auto touch-target"
              >
                {t('cta.consultation')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contatti"
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors w-full sm:w-auto touch-target"
              >
                {t('cta.contact')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
