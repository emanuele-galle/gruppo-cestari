'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Newspaper,
  TrendingUp,
  FileText,
  BarChart3,
  Globe,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Square,
  CheckSquare,
  ArrowUpDown,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { exportToCSV, generateExportFilename } from '@/lib/export-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  PageHeader,
  StatsCard,
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  PublishedBadge,
  BulkActionsBar,
  bulkActionPresets,
  ActionButton,
  MobileCard,
  MobileCardSkeleton,
} from '@/components/admin';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
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

export default function AdminNewsPage() {
  const t = useTranslations('admin.news');
  const locale = useLocale() as 'it' | 'en' | 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublished, setSelectedPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'publishedAt' | 'viewCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Fetch news
  const { data, isLoading, refetch } = trpc.news.list.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    isPublished: selectedPublished === 'all' ? undefined : selectedPublished === 'published',
    locale,
    sortBy,
    sortOrder,
  });

  // Delete mutation
  const deleteMutation = trpc.news.delete.useMutation({
    onSuccess: () => {
      toast.success('News eliminata con successo');
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = trpc.news.togglePublish.useMutation({
    onSuccess: () => {
      toast.success('Stato pubblicazione aggiornato');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  // Selection helpers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (data?.items) {
      setSelectedIds(new Set(data.items.map((item) => item.id)));
    }
  }, [data?.items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useMemo(() => {
    if (!data?.items || data.items.length === 0) return false;
    return data.items.every((item) => selectedIds.has(item.id));
  }, [data?.items, selectedIds]);

  // Bulk publish
  const handleBulkPublish = useCallback(async () => {
    const ids = Array.from(selectedIds);
    let successCount = 0;
    for (const id of ids) {
      try {
        await togglePublishMutation.mutateAsync({ id });
        successCount++;
      } catch {
        // Continue with other items
      }
    }
    toast.success(`${successCount} articoli pubblicati`);
    clearSelection();
    refetch();
  }, [selectedIds, togglePublishMutation, clearSelection, refetch]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    let successCount = 0;
    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync({ id });
        successCount++;
      } catch {
        // Continue with other items
      }
    }
    toast.success(`${successCount} articoli eliminati`);
    clearSelection();
    setBulkDeleteOpen(false);
    refetch();
  }, [selectedIds, deleteMutation, clearSelection, refetch]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (!data?.items) return;

    const exportData = data.items
      .filter((item) => selectedIds.size === 0 || selectedIds.has(item.id))
      .map((article) => {
        const translation = getTranslation(article.translations);
        return {
          Titolo: translation?.title || '',
          Slug: article.slug,
          Categoria: article.category?.translations[0]?.name || '',
          Pubblicato: article.isPublished ? 'Sì' : 'No',
          DataPubblicazione: article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('it-IT')
            : '',
          Visualizzazioni: article.viewCount,
          Lingue: article.translations.map((t) => t.locale.toUpperCase()).join(', '),
        };
      });

    exportToCSV(exportData, {
      filename: generateExportFilename('news'),
      headers: {
        Titolo: 'Titolo',
        Slug: 'Slug',
        Categoria: 'Categoria',
        Pubblicato: 'Pubblicato',
        DataPubblicazione: 'Data Pubblicazione',
        Visualizzazioni: 'Visualizzazioni',
        Lingue: 'Lingue',
      },
    });

    toast.success(`Esportati ${exportData.length} articoli`);
  }, [data?.items, selectedIds]);

  const getTranslation = (translations: { locale: string; title: string }[]) => {
    const trans = translations.find((t) => t.locale === locale) || translations[0];
    return trans;
  };

  // Calculate stats
  type NewsItem = NonNullable<typeof data>['items'][number];
  const totalNews = data?.pagination.total || 0;
  const publishedNews = data?.items.filter((n: NewsItem) => n.isPublished).length || 0;
  const draftNews = data?.items.filter((n: NewsItem) => !n.isPublished).length || 0;
  const totalViews = data?.items.reduce((acc: number, n: NewsItem) => acc + n.viewCount, 0) || 0;

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
          badge={{ label: `${totalNews} articoli`, variant: 'info' }}
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="p-2.5 text-slate-500 hover:text-emerald-600 bg-slate-100/50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all"
              title="Esporta CSV"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100/50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <Link href="/admin/news/nuovo">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t('newArticle')}
              </motion.button>
            </Link>
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totale Articoli"
          value={totalNews}
          icon={Newspaper}
          color="blue"
          trend={{ value: 12 }}
        />
        <StatsCard
          title="Pubblicati"
          value={publishedNews}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Bozze"
          value={draftNews}
          icon={FileText}
          color="orange"
        />
        <StatsCard
          title="Visualizzazioni"
          value={totalViews.toLocaleString()}
          icon={BarChart3}
          color="purple"
          trend={{ value: 24 }}
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Search className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[180px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={selectedPublished}
                  onChange={(e) => {
                    setSelectedPublished(e.target.value as 'all' | 'published' | 'draft');
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="published">Pubblicati</option>
                  <option value="draft">Bozze</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="relative min-w-[220px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <ArrowUpDown className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="createdAt-desc">Creazione (recenti)</option>
                  <option value="createdAt-asc">Creazione (vecchi)</option>
                  <option value="publishedAt-desc">Pubblicazione (recenti)</option>
                  <option value="publishedAt-asc">Pubblicazione (vecchi)</option>
                  <option value="viewCount-desc">Visualizzazioni (max)</option>
                  <option value="viewCount-asc">Visualizzazioni (min)</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* News Content */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Articoli
              </h3>
              <span className="text-sm text-slate-500">
                {data?.pagination.total || 0} totali
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <span className="text-slate-500">Caricamento articoli...</span>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                  {data?.items.map((article: NewsItem, index: number) => {
                    const translation = getTranslation(article.translations);
                    return (
                      <MobileCard
                        key={article.id}
                        index={index}
                        image={article.featuredImage}
                        imageAlt={translation?.title || ''}
                        title={translation?.title || 'Senza titolo'}
                        subtitle={`/${article.slug}`}
                        selectable
                        selected={selectedIds.has(article.id)}
                        onSelect={() => toggleSelection(article.id)}
                        badges={[
                          {
                            variant: article.isPublished ? 'success' : 'default',
                            label: article.isPublished ? 'Pubblicato' : 'Bozza',
                            icon: article.isPublished ? CheckCircle : undefined,
                          },
                          ...(article.category ? [{
                            variant: 'purple' as const,
                            label: article.category.translations[0]?.name || article.category.slug,
                          }] : []),
                        ]}
                        metadata={[
                          { icon: Calendar, label: article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                            : new Date(article.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                          },
                          { icon: Eye, label: article.viewCount.toLocaleString() },
                          { icon: Globe, label: article.translations.map(t => t.locale.toUpperCase()).join(', ') },
                        ]}
                        actions={
                          <div className="flex items-center gap-1">
                            <ActionButton
                              icon={Edit}
                              label="Modifica"
                              variant="edit"
                              href={`/admin/news/${article.id}/modifica`}
                              size="sm"
                            />
                            <ActionButton
                              icon={Eye}
                              label="Visualizza"
                              variant="view"
                              href={`/news/${article.slug}`}
                              target="_blank"
                              size="sm"
                            />
                            <ActionButton
                              icon={MoreVertical}
                              label="Menu"
                              variant="menu"
                              size="sm"
                              onClick={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                            />
                          </div>
                        }
                      />
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="w-12 px-4 py-4">
                          <button
                            onClick={isAllSelected ? clearSelection : selectAll}
                            className={`p-1 rounded-lg transition-all ${
                              isAllSelected ? 'text-primary' : 'text-slate-400 hover:text-primary'
                            }`}
                          >
                            {isAllSelected ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Articolo
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Lingue
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data?.items.map((article: NewsItem, index: number) => {
                        const translation = getTranslation(article.translations);
                        return (
                          <motion.tr
                            key={article.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`hover:bg-slate-100/30 transition-colors group ${selectedIds.has(article.id) ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleSelection(article.id)}
                                className={`p-1 rounded-lg transition-all ${
                                  selectedIds.has(article.id) ? 'text-primary' : 'text-slate-400 hover:text-primary'
                                }`}
                              >
                                {selectedIds.has(article.id) ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-primary/30 transition-colors relative">
                                  {article.featuredImage ? (
                                    <Image
                                      src={article.featuredImage}
                                      alt={translation?.title || 'News image'}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                      unoptimized={article.featuredImage.startsWith('http://localhost')}
                                    />
                                  ) : (
                                    <Newspaper className="w-5 h-5 text-slate-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                                    {translation?.title || 'Senza titolo'}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    /{article.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {article.category ? (
                                <StatusBadge variant="purple">
                                  {article.category.translations[0]?.name || article.category.slug}
                                </StatusBadge>
                              ) : (
                                <span className="text-slate-500 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {article.isPublished ? (
                                article.publishedAt && new Date(article.publishedAt) > new Date() ? (
                                  <StatusBadge variant="info" icon={Clock} pulse>
                                    Programmato
                                  </StatusBadge>
                                ) : (
                                  <StatusBadge variant="success" icon={CheckCircle}>
                                    Pubblicato
                                  </StatusBadge>
                                )
                              ) : (
                                <StatusBadge variant="default" icon={XCircle}>
                                  Bozza
                                </StatusBadge>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {article.translations.map((trans: (typeof article.translations)[number]) => (
                                  <span
                                    key={trans.locale}
                                    className="px-2 py-1 text-xs font-bold bg-primary/20 text-primary rounded-lg uppercase"
                                  >
                                    {trans.locale}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="w-4 h-4" />
                                {article.publishedAt
                                  ? new Date(article.publishedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : new Date(article.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-slate-500 bg-slate-100/50 px-2 py-1 rounded-lg">
                                  <Eye className="w-4 h-4" />
                                  {article.viewCount.toLocaleString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative flex items-center justify-end gap-1">
                                <ActionButton
                                  icon={Edit}
                                  label="Modifica articolo"
                                  variant="edit"
                                  href={`/admin/news/${article.id}/modifica`}
                                />
                                <ActionButton
                                  icon={Eye}
                                  label="Visualizza articolo"
                                  variant="view"
                                  href={`/news/${article.slug}`}
                                  target="_blank"
                                />
                                <div className="relative">
                                  <ActionButton
                                    icon={MoreVertical}
                                    label="Menu azioni"
                                    variant="menu"
                                    onClick={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                                  />
                                  {openMenuId === article.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setOpenMenuId(null)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-32px)] bg-white rounded-xl border border-slate-200 shadow-xl shadow-black/20 z-50 overflow-hidden"
                                      >
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                          onClick={() => {
                                            togglePublishMutation.mutate({ id: article.id });
                                            setOpenMenuId(null);
                                          }}
                                        >
                                          {article.isPublished ? (
                                            <>
                                              <XCircle className="w-5 h-5 text-amber-600" />
                                              Rimuovi pubblicazione
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                                              Pubblica ora
                                            </>
                                          )}
                                        </button>
                                        <div className="h-px bg-border" />
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
                                          onClick={() => {
                                            setDeleteId(article.id);
                                            setOpenMenuId(null);
                                          }}
                                        >
                                          <Trash2 className="w-5 h-5" />
                                          Elimina articolo
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Grid View */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data?.items.map((article: NewsItem, index: number) => {
                  const translation = getTranslation(article.translations);
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-slate-100/30 rounded-xl border border-slate-200 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                    >
                      <div className="aspect-video bg-slate-100 relative overflow-hidden">
                        {article.featuredImage ? (
                          <Image
                            src={article.featuredImage}
                            alt={translation?.title || 'News image'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized={article.featuredImage.startsWith('http://localhost')}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-slate-500/50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <PublishedBadge published={article.isPublished} />
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          {article.translations.map((trans: (typeof article.translations)[number]) => (
                            <span
                              key={trans.locale}
                              className="px-2 py-1 text-xs font-bold bg-black/50 backdrop-blur text-white rounded-lg uppercase"
                            >
                              {trans.locale}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-slate-800 font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {translation?.title || 'Senza titolo'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-mono">/{article.slug}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(article.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {article.viewCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/news/${article.id}/modifica`}
                              className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteId(article.id)}
                              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data?.items.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Newspaper className="w-8 h-8 text-slate-500/50" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessun articolo trovato</h3>
                <p className="text-slate-500 mb-6">Inizia creando il tuo primo articolo</p>
                <Link href="/admin/news/nuovo">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25"
                  >
                    <Plus className="w-5 h-5" />
                    Crea il primo articolo
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Pagina <span className="font-semibold text-slate-800">{data.pagination.page}</span> di{' '}
                  <span className="font-semibold text-slate-800">{data.pagination.totalPages}</span>
                  <span className="text-slate-500/70 ml-2">({data.pagination.total} articoli)</span>
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-800/80 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Precedente
                  </motion.button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-800/80 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Successivo
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={data?.items.length || 0}
        onClearSelection={clearSelection}
        onSelectAll={selectAll}
        isAllSelected={isAllSelected}
        actions={[
          bulkActionPresets.export(handleExport),
          bulkActionPresets.publish(handleBulkPublish, togglePublishMutation.isPending),
          bulkActionPresets.delete(() => setBulkDeleteOpen(true)),
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">Elimina articolo</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non può essere annullata. L&apos;articolo verrà eliminato permanentemente insieme a tutte le sue traduzioni.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-100/80">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Elimina'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">Elimina {selectedIds.size} articoli</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non può essere annullata. Gli articoli selezionati verranno eliminati permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-100/80">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Elimina ${selectedIds.size} articoli`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
