'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  X,
  Newspaper,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

// Tailwind-safe focal point classes mapping
const FOCAL_POINT_CLASSES: Record<string, string> = {
  'top': 'object-top',
  'center': 'object-center',
  'bottom': 'object-bottom',
  'left': 'object-left',
  'right': 'object-right',
  'top-left': 'object-left-top',
  'top-right': 'object-right-top',
  'bottom-left': 'object-left-bottom',
  'bottom-right': 'object-right-bottom',
};

// Skeleton component for loading states
function NewsSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 animate-pulse h-full flex flex-col">
      <div className="h-48 bg-slate-200" />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-full bg-slate-200 rounded mb-2" />
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-4 flex-1" />
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
      <div className="grid md:grid-cols-2">
        <div className="h-64 md:h-96 bg-slate-200" />
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-5 w-32 bg-slate-200 rounded" />
          </div>
          <div className="h-8 w-full bg-slate-200 rounded mb-2" />
          <div className="h-8 w-3/4 bg-slate-200 rounded mb-4" />
          <div className="h-5 w-full bg-slate-200 rounded mb-2" />
          <div className="h-5 w-5/6 bg-slate-200 rounded mb-6" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-28 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function NewsClient() {
  const t = useTranslations('news');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // URL params
  const categoryFromUrl = searchParams.get('categoria') || '';
  const pageFromUrl = parseInt(searchParams.get('pagina') || '1', 10);
  const searchFromUrl = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [page, setPage] = useState(pageFromUrl);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // Update URL when filters change
  const updateURL = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '1') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    const query = newParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Sync URL params with state
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory) params.categoria = selectedCategory;
    if (page > 1) params.pagina = page.toString();
    if (debouncedSearch) params.q = debouncedSearch;
    updateURL(params);
  }, [selectedCategory, page, debouncedSearch, updateURL]);

  // Fetch categories
  const { data: categoriesData } = trpc.news.listCategories.useQuery({
    locale,
  });

  // Fetch news
  const { data, isLoading, error } = trpc.news.listPublic.useQuery({
    page,
    limit: 9,
    categoryId: selectedCategory || undefined,
    locale,
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset page when category changes
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPage(1);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterError(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore durante l\'iscrizione');
      }

      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterError(err instanceof Error ? err.message : 'Si è verificato un errore');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale === 'it' ? 'it-IT' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateShort = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale === 'it' ? 'it-IT' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate read time (approx 200 words per minute)
  const calculateReadTime = (content: string | undefined) => {
    if (!content) return 3;
    return Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200);
  };

  // Decode HTML entities (fixes &#8217 etc.)
  const decodeHtmlEntities = (text: string | undefined) => {
    if (!text) return '';
    // Replace common HTML entities
    return text
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8230;/g, '…')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  // Filter by search query on client side
  type NewsItem = NonNullable<typeof data>['items'][number];
  const filteredNews = useMemo(() => {
    if (!data?.items) return [];
    if (!debouncedSearch) return data.items;

    return data.items.filter((news: NewsItem) => {
      const translation = news.translations[0];
      if (!translation) return false;
      return (
        translation.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (translation.excerpt && translation.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    });
  }, [data?.items, debouncedSearch]);

  const featuredNews = data?.featured;
  const featuredTranslation = featuredNews?.translations[0];
  const hasActiveFilters = selectedCategory || debouncedSearch;

  // Calculate total published articles
  const totalArticles = useMemo(() => {
    if (!categoriesData) return 0;
    return categoriesData.reduce((acc, cat) => acc + cat._count.news, 0);
  }, [categoriesData]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-14 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background gradient - brand colors (primary blue to secondary green) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary to-slate-800" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing orbs - brand colors */}
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/25 blur-[100px]"
            animate={{
              scale: [1.1, 1, 1.1],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-500/15 blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Flowing news feed lines - brand colors */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="newsLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            {/* Horizontal flowing lines - like news ticker */}
            <motion.line
              x1="0" y1="25%" x2="100%" y2="25%"
              stroke="url(#newsLineGradient)"
              strokeWidth="1"
              initial={{ x1: '-100%', x2: '0%' }}
              animate={{ x1: '0%', x2: '100%' }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.line
              x1="0" y1="50%" x2="100%" y2="50%"
              stroke="url(#newsLineGradient)"
              strokeWidth="1"
              initial={{ x1: '100%', x2: '200%' }}
              animate={{ x1: '-100%', x2: '0%' }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.line
              x1="0" y1="75%" x2="100%" y2="75%"
              stroke="url(#newsLineGradient)"
              strokeWidth="1"
              initial={{ x1: '-100%', x2: '0%' }}
              animate={{ x1: '0%', x2: '100%' }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 2 }}
            />
          </svg>

          {/* Floating document/news elements - brand colors */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + i * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            >
              {i % 3 === 0 ? (
                <div className="w-8 h-10 border border-white/20 rounded bg-white/5">
                  <div className="w-full h-2 bg-white/20 mt-1" />
                  <div className="w-3/4 h-1 bg-white/10 mt-1 ml-1" />
                  <div className="w-1/2 h-1 bg-white/10 mt-1 ml-1" />
                </div>
              ) : i % 3 === 1 ? (
                <div className="w-3 h-3 bg-secondary/40 rounded-full" />
              ) : (
                <FileText className="w-5 h-5 text-white/20" />
              )}
            </motion.div>
          ))}

          {/* Broadcast circles - like signal waves */}
          <div className="absolute bottom-1/4 right-1/4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-24 h-24 border border-secondary/30 rounded-full"
                style={{ top: -48, left: -48 }}
                animate={{
                  scale: [1, 2.5, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 1,
                }}
              />
            ))}
          </div>

          {/* Moving dots - like data flow */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-1.5 h-1.5 bg-secondary/50 rounded-full"
              style={{
                left: `${i * 25}%`,
                top: '30%',
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, 20, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.8,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-secondary text-sm font-medium mb-4 sm:mb-6 border border-secondary/30"
            >
              <Newspaper className="w-4 h-4" />
              {t('hero.badge')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl xs:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('hero.title').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-emerald-300">
                {t('hero.title').split(' ').slice(-1)}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto px-2"
            >
              {t('hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Search and Category Filters */}
      <section className="py-4 sm:py-6 lg:py-8 bg-white border-b border-slate-200 sticky top-16 sm:top-20 lg:top-24 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 sm:pl-12 sm:pr-10 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-target"
                  aria-label={t('search.placeholder')}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors touch-target"
                    aria-label="Cancella ricerca"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            {categoriesData && categoriesData.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {/* All categories pill */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange('')}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-target ${
                    !selectedCategory
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{t('categories.all')}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                    !selectedCategory ? 'bg-white/20' : 'bg-slate-200'
                  }`}>
                    {totalArticles}
                  </span>
                </motion.button>

                {categoriesData.map((category) => {
                  const translation = category.translations[0];
                  if (!translation) return null;
                  const isActive = selectedCategory === category.id;

                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-target ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {translation.name}
                      {category._count.news > 0 && (
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                          isActive ? 'bg-white/20' : 'bg-slate-200'
                        }`}>
                          {category._count.news}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Active filters indicator */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-sm text-slate-500">
                    {filteredNews.length} {filteredNews.length === 1 ? 'risultato' : 'risultati'}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancella filtri
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-8 sm:py-10 lg:py-12 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <FeaturedSkeleton />
          ) : featuredNews && featuredTranslation && !selectedCategory && !debouncedSearch ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/news/${featuredNews.slug}`}>
                <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group">
                  <div className="grid md:grid-cols-2">
                    <div className="h-48 sm:h-64 md:h-96 relative overflow-hidden">
                      {featuredNews.featuredImage ? (
                        <Image
                          src={featuredNews.featuredImage}
                          alt={featuredTranslation?.title ?? ''}
                          fill
                          className={`object-cover ${FOCAL_POINT_CLASSES[featuredNews.focalPoint || 'top'] || 'object-top'} group-hover:scale-105 transition-transform duration-500`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Tag className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      {/* Featured badge */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-secondary text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                          In Evidenza
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 md:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        {featuredNews.category?.translations?.[0]?.name && (
                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full">
                            {featuredNews.category.translations[0].name}
                          </span>
                        )}
                        {featuredNews.publishedAt && (
                          <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {formatDate(featuredNews.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-primary transition-colors">
                        {featuredTranslation?.title ?? 'Senza titolo'}
                      </h2>
                      {featuredTranslation?.excerpt && (
                        <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                          {decodeHtmlEntities(featuredTranslation.excerpt)}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {calculateReadTime(featuredTranslation?.content)} {t('readTime')}
                        </span>
                        <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-sm">
                          {t('readMore')}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* News Grid */}
      <section className="py-8 sm:py-10 lg:py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <NewsSkeleton key={i} />
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg text-slate-600">{t('errors.loading')}</p>
              </motion.div>
            ) : filteredNews.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {t('empty.title')}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {t('empty.message')}
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {t('empty.resetFilters')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${selectedCategory}-${page}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              >
                {filteredNews.map((news: NewsItem, index: number) => {
                  const translation = news.translations[0];
                  if (!translation) return null;

                  const categoryName = news.category?.translations?.[0]?.name || 'News';

                  return (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/news/${news.slug}`}>
                        <motion.div
                          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)' }}
                          className="bg-white rounded-xl overflow-hidden border border-slate-200 group h-full flex flex-col"
                        >
                          <div className="h-44 sm:h-52 lg:h-56 relative overflow-hidden">
                            {news.featuredImage ? (
                              <Image
                                src={news.featuredImage}
                                alt={translation?.title ?? 'News'}
                                fill
                                className={`object-cover ${FOCAL_POINT_CLASSES[news.focalPoint || 'center'] || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                <Tag className="w-10 h-10 sm:w-12 sm:h-12 text-primary/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <span className="px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded">
                                {categoryName}
                              </span>
                              {news.publishedAt && (
                                <span className="text-[10px] sm:text-xs text-slate-500">
                                  {formatDateShort(news.publishedAt)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {translation?.title ?? 'News'}
                            </h3>
                            {translation.excerpt && (
                              <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
                                {decodeHtmlEntities(translation.excerpt)}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {calculateReadTime(translation.content)} {t('readTime')}
                              </span>
                              <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                {t('readMore')}
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Pagina precedente"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    p === page
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-primary/50'
                  }`}
                  aria-label={`Pagina ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Pagina successiva"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/25 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" />
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              Newsletter
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-lg text-white/70 mb-8">
              {t('newsletter.subtitle')}
            </p>

            {newsletterSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <CheckCircle2 className="w-12 h-12 text-secondary" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('newsletter.success.title')}
                  </h3>
                  <p className="text-white/70">
                    {t('newsletter.success.message')}
                  </p>
                </div>
                <button
                  onClick={() => setNewsletterSuccess(false)}
                  className="text-sm text-white/70 hover:text-white underline"
                >
                  {t('newsletter.success.another')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                {newsletterError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{newsletterError}</span>
                  </motion.div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t('newsletter.placeholder')}
                    required
                    aria-label={t('newsletter.placeholder')}
                    className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {newsletterLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                        />
                        {t('newsletter.subscribing')}
                      </>
                    ) : (
                      t('newsletter.subscribe')
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
