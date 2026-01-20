'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Loader2,
  Tag,
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { SocialShare } from '@/components/public/social-share';
import { ReadingProgress } from '@/components/ui/reading-progress';
import { useState, useEffect } from 'react';

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

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const t = useTranslations('news');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const { data: news, isLoading, error } = trpc.news.getBySlug.useQuery({
    slug: resolvedParams.slug,
    locale,
  });

  // Fetch related news
  const { data: relatedNews } = trpc.news.listPublic.useQuery({
    page: 1,
    limit: 4,
    categoryId: news?.category?.id,
    locale,
  }, {
    enabled: !!news?.category?.id,
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    notFound();
  }

  const translation = news.translations[0];
  if (!translation) {
    notFound();
  }

  const categoryTranslation = news.category?.translations?.[0];
  const categoryName = categoryTranslation?.name || news.category?.slug || 'News';

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
  const wordCount = translation.content
    ? translation.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    : 0;
  const readTime = Math.ceil(wordCount / 200) || 3;

  // Filter out current article from related
  const filteredRelated = relatedNews?.items.filter(item => item.id !== news.id).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Reading Progress Bar */}
      <ReadingProgress color="bg-primary" height={3} />

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] lg:min-h-[600px]">
        {news.featuredImage ? (
          <Image
            src={news.featuredImage}
            alt={translation.title}
            fill
            className={`object-cover ${FOCAL_POINT_CLASSES[news.focalPoint || 'center'] || 'object-center'}`}
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-white/90 text-sm mb-6" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/news" className="hover:text-white transition-colors">
                  News
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{categoryName}</span>
              </nav>

              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                  {categoryName}
                </span>
                {news.publishedAt && (
                  <span className="text-white/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(news.publishedAt)}
                  </span>
                )}
                <span className="text-white/80 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {readTime} {t('readTime')}
                </span>
                {news.viewCount !== undefined && news.viewCount > 0 && (
                  <span className="text-white/80 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {news.viewCount.toLocaleString('it-IT')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">
                {translation.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* Excerpt */}
              {translation.excerpt && (
                <p className="text-xl text-slate-600 mb-8 leading-relaxed border-l-4 border-primary pl-6">
                  {translation.excerpt}
                </p>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-slate-800 prose-headings:font-bold
                  prose-h1:hidden
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                  prose-ul:my-4 prose-ul:pl-6
                  prose-li:text-slate-600 prose-li:mb-2
                  prose-strong:text-slate-800
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: translation.content }}
              />

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-slate-600" />
                    {news.tags.map((newsTag: (typeof news.tags)[number]) => (
                      <span
                        key={newsTag.tag.id}
                        className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-slate-200 transition-colors cursor-default"
                      >
                        {newsTag.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <SocialShare
                    url={currentUrl || `https://gruppocestari.com/news/${news.slug}`}
                    title={translation.title}
                    description={translation.excerpt || ''}
                  />

                  {/* Copy Link Button */}
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2 text-green-600"
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('detail.copied')}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('detail.copyLink')}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.article>

            {/* Sidebar - Sticky */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* CTA Box */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg shadow-primary/20">
                  <h3 className="text-lg font-bold mb-3">{t('detail.stayUpdated')}</h3>
                  <p className="text-white/80 text-sm mb-4">
                    {t('detail.stayUpdatedDesc')}
                  </p>
                  <Link href="/contatti">
                    <button className="w-full py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
                      {t('detail.contactUs')}
                    </button>
                  </Link>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t('detail.articleInfo')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{t('detail.category')}</p>
                        <p className="font-medium text-slate-800">{categoryName}</p>
                      </div>
                    </div>
                    {news.publishedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{t('detail.publishDate')}</p>
                          <p className="font-medium text-slate-800">{formatDate(news.publishedAt)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{t('detail.readingTime')}</p>
                        <p className="font-medium text-slate-800">{readTime} {t('detail.minutes')}</p>
                      </div>
                    </div>
                    {news.viewCount !== undefined && news.viewCount > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{t('detail.views')}</p>
                          <p className="font-medium text-slate-800">{news.viewCount.toLocaleString('it-IT')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back to News Link */}
                <Link href="/news">
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t('detail.backToNews')}
                  </button>
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {filteredRelated.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {t('detail.relatedArticles')}
                  </h2>
                  <p className="text-slate-500 mt-1">
                    {t('detail.relatedArticlesDesc')}
                  </p>
                </div>
                <Link
                  href="/news"
                  className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  {t('detail.viewAll')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRelated.map((item, index) => {
                  const itemTranslation = item.translations[0];
                  if (!itemTranslation) return null;

                  const itemCategoryName = item.category?.translations?.[0]?.name || 'News';
                  const itemReadTime = itemTranslation.content
                    ? Math.ceil(itemTranslation.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
                    : 3;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/news/${item.slug}`}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group h-full flex flex-col"
                        >
                          <div className="h-40 relative overflow-hidden">
                            {item.featuredImage ? (
                              <Image
                                src={item.featuredImage}
                                alt={itemTranslation.title}
                                fill
                                className={`object-cover ${FOCAL_POINT_CLASSES[item.focalPoint || 'top'] || 'object-top'} group-hover:scale-105 transition-transform duration-500`}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                <Tag className="w-10 h-10 text-primary/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                {itemCategoryName}
                              </span>
                              {item.publishedAt && (
                                <span className="text-xs text-slate-500">
                                  {formatDateShort(item.publishedAt)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                              {itemTranslation.title}
                            </h3>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {itemReadTime} {t('readTime')}
                              </span>
                              <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
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
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-primary font-medium"
                >
                  {t('detail.viewAll')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-40">
        <div className="flex gap-3">
          <Link href="/news" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg">
              <ArrowLeft className="w-4 h-4" />
              News
            </button>
          </Link>
          <Link href="/contatti" className="flex-1">
            <button className="w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/20">
              {t('detail.contactUs')}
            </button>
          </Link>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
