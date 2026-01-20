'use client';

import { useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface NewsArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  gradient: string;
  focalPoint: string;
}

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

const CATEGORY_GRADIENTS: Record<string, string> = {
  'default': 'from-blue-500 to-primary',
  'energia': 'from-amber-500 to-orange-600',
  'cooperazione': 'from-emerald-500 to-secondary',
  'finanza': 'from-blue-500 to-primary',
  'formazione': 'from-purple-500 to-violet-600',
};

function NewsCard({
  article,
  index,
  isInView,
  formatDate,
}: {
  article: NewsArticle;
  index: number;
  isInView: boolean;
  formatDate: (date: string) => string;
}) {
  const tCommon = useTranslations('common');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/news/${article.slug}`} className="group block h-full">
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          {/* Image with overlay */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={article.image || '/images/placeholder.jpg'}
              alt={article.title}
              fill
              className={`object-cover ${FOCAL_POINT_CLASSES[article.focalPoint] || 'object-top'} transition-transform duration-700 group-hover:scale-110`}
            />

            {/* Animated overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"
              animate={{ opacity: isHovered ? 0.9 : 0.6 }}
              transition={{ duration: 0.3 }}
            />

            {/* Category badge */}
            <motion.div
              className="absolute top-4 left-4"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.15 }}
            >
              <span
                className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${article.gradient} text-white text-xs font-semibold shadow-lg`}
              >
                {article.category}
              </span>
            </motion.div>

            {/* Hover reveal content */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ scale: isHovered ? 1 : 0.8 }}
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Animated line */}
          <motion.div
            className={`h-1 bg-gradient-to-r ${article.gradient}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformOrigin: 'left' }}
          />

          {/* Content */}
          <div className="p-6">
            {/* Date */}
            <motion.div
              className="flex items-center gap-2 text-sm text-slate-500 mb-3"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 + index * 0.15 }}
            >
              <Calendar className="w-4 h-4" />
              {formatDate(article.date)}
            </motion.div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-800 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-slate-600 text-sm line-clamp-2 mb-4">{article.excerpt}</p>

            {/* Read more */}
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              animate={{ x: isHovered ? 5 : 0 }}
            >
              {tCommon('readMore')}
              <motion.span animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.span>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}

export function NewsSection() {
  const t = useTranslations('home.news');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Fetch latest news from database
  const { data, isLoading } = trpc.news.listPublic.useQuery({
    page: 1,
    limit: 3,
    locale,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Transform database news to component format
  const news: NewsArticle[] = (data?.items || []).map((item) => {
    const translation = item.translations[0];
    const categoryName = item.category?.translations[0]?.name?.toLowerCase() || 'default';

    return {
      slug: item.slug,
      title: translation?.title || 'Senza titolo',
      excerpt: translation?.excerpt || translation?.content?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
      date: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date(item.createdAt).toISOString(),
      category: item.category?.translations[0]?.name || 'News',
      image: item.featuredImage || '/images/placeholder.jpg',
      gradient: CATEGORY_GRADIENTS[categoryName] || CATEGORY_GRADIENTS['default'],
      focalPoint: item.focalPoint || 'top',
    };
  });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Solid background */}
      <div className="absolute inset-0 bg-white" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/3 left-10 w-24 h-24 rounded-full bg-primary/10 blur-2xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl"
        animate={{ y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              {t('subtitle')}
            </motion.span>
            <h2 className="text-4xl lg:text-5xl text-slate-800">
              {t('title').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-gradient">{t('title').split(' ').slice(-1)}</span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/news"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              {t('viewAll')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">Nessuna notizia disponibile</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {news.map((article, index) => (
              <NewsCard
                key={article.slug}
                article={article}
                index={index}
                isInView={isInView}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
