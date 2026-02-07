'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
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
  Loader2,
  RefreshCw,
  FolderKanban,
  Globe,
  ChevronLeft,
  ChevronRight,
  Download,
  Square,
  CheckSquare,
  Star,
  MapPin,
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

const SECTOR_LABELS: Record<string, string> = {
  FINANCE: 'Finanza',
  COOPERATION: 'Cooperazione',
  RENEWABLE_ENERGY: 'Energie Rinnovabili',
  DEVELOPMENT: 'Sviluppo',
  REAL_ESTATE: 'Immobiliare',
  OTHER: 'Altro',
};

const COUNTRY_LABELS: Record<string, string> = {
  IT: 'Italia',
  FR: 'Francia',
  DE: 'Germania',
  ES: 'Spagna',
  GB: 'Regno Unito',
  BE: 'Belgio',
  CH: 'Svizzera',
  ET: 'Etiopia',
  KE: 'Kenya',
  TZ: 'Tanzania',
  MZ: 'Mozambico',
  AO: 'Angola',
  ZA: 'Sud Africa',
  MA: 'Marocco',
  EG: 'Egitto',
  NG: 'Nigeria',
  GH: 'Ghana',
  SN: 'Senegal',
  CI: 'Costa d\'Avorio',
  CD: 'RD Congo',
  UG: 'Uganda',
  RW: 'Rwanda',
};

export default function AdminProjectsPage() {
  const t = useTranslations('admin');
  const locale = useLocale() as 'it' | 'en' | 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedPublished, setSelectedPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Fetch projects
  const { data, isLoading, refetch } = trpc.projects.list.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    sector: selectedSector === 'all' ? undefined : selectedSector as 'FINANCE' | 'COOPERATION' | 'RENEWABLE_ENERGY' | 'DEVELOPMENT' | 'OTHER',
    isPublished: selectedPublished === 'all' ? undefined : selectedPublished === 'published',
    locale,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  // Delete mutation
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success('Progetto eliminato con successo');
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = trpc.projects.togglePublish.useMutation({
    onSuccess: () => {
      toast.success('Stato pubblicazione aggiornato');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = trpc.projects.toggleFeatured.useMutation({
    onSuccess: () => {
      toast.success('Stato evidenza aggiornato');
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
    toast.success(`${successCount} progetti aggiornati`);
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
    toast.success(`${successCount} progetti eliminati`);
    clearSelection();
    setBulkDeleteOpen(false);
    refetch();
  }, [selectedIds, deleteMutation, clearSelection, refetch]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (!data?.items) return;

    const exportData = data.items
      .filter((item) => selectedIds.size === 0 || selectedIds.has(item.id))
      .map((project) => {
        const translation = getTranslation(project.translations);
        return {
          Titolo: translation?.title || '',
          Slug: project.slug,
          Settore: SECTOR_LABELS[project.sector] || project.sector,
          Paese: COUNTRY_LABELS[project.country] || project.country,
          Pubblicato: project.isPublished ? 'Si' : 'No',
          InEvidenza: project.isFeatured ? 'Si' : 'No',
          Lingue: project.translations.map((t) => t.locale.toUpperCase()).join(', '),
        };
      });

    exportToCSV(exportData, {
      filename: generateExportFilename('progetti'),
      headers: {
        Titolo: 'Titolo',
        Slug: 'Slug',
        Settore: 'Settore',
        Paese: 'Paese',
        Pubblicato: 'Pubblicato',
        InEvidenza: 'In Evidenza',
        Lingue: 'Lingue',
      },
    });

    toast.success(`Esportati ${exportData.length} progetti`);
  }, [data?.items, selectedIds]);

  const getTranslation = (translations: { locale: string; title: string }[]) => {
    const trans = translations.find((t) => t.locale === locale) || translations[0];
    return trans;
  };

  // Calculate stats
  type ProjectItem = NonNullable<typeof data>['items'][number];
  const totalProjects = data?.pagination.total || 0;
  const publishedProjects = data?.items.filter((n: ProjectItem) => n.isPublished).length || 0;
  const draftProjects = data?.items.filter((n: ProjectItem) => !n.isPublished).length || 0;
  const featuredProjects = data?.items.filter((n: ProjectItem) => n.isFeatured).length || 0;

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
          title="Gestione Progetti"
          description="Gestisci i progetti del Gruppo Cestari"
          badge={{ label: `${totalProjects} progetti`, variant: 'info' }}
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
            <Link href="/admin/progetti/nuovo">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <Plus className="w-5 h-5" />
                Nuovo Progetto
              </motion.button>
            </Link>
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totale Progetti"
          value={totalProjects}
          icon={FolderKanban}
          color="blue"
        />
        <StatsCard
          title="Pubblicati"
          value={publishedProjects}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Bozze"
          value={draftProjects}
          icon={XCircle}
          color="orange"
        />
        <StatsCard
          title="In Evidenza"
          value={featuredProjects}
          icon={Star}
          color="purple"
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
                  placeholder="Cerca progetti..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Sector Filter */}
              <div className="relative min-w-[180px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="all">Tutti i settori</option>
                  {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={selectedPublished}
                  onChange={(e) => {
                    setSelectedPublished(e.target.value as 'all' | 'published' | 'draft');
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="published">Pubblicati</option>
                  <option value="draft">Bozze</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Content */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-primary" />
                Progetti
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
                  <span className="text-slate-500">Caricamento progetti...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                  {data?.items.map((project: ProjectItem) => {
                    const translation = getTranslation(project.translations);
                    return (
                      <MobileCard
                        key={project.id}
                        image={project.featuredImage}
                        title={translation?.title || 'Senza titolo'}
                        subtitle={`/${project.slug}`}
                        badges={[
                          {
                            variant: project.isPublished ? 'success' : 'default',
                            label: project.isPublished ? 'Pubblicato' : 'Bozza',
                            icon: project.isPublished ? CheckCircle : XCircle,
                          },
                          {
                            variant: 'purple',
                            label: SECTOR_LABELS[project.sector] || project.sector,
                          },
                          ...(project.isFeatured ? [{
                            variant: 'warning' as const,
                            label: 'In Evidenza',
                            icon: Star,
                          }] : []),
                        ]}
                        metadata={[
                          { icon: MapPin, label: COUNTRY_LABELS[project.country] || project.country },
                          { icon: Globe, label: project.translations.map(t => t.locale.toUpperCase()).join(', ') },
                        ]}
                        selectable
                        selected={selectedIds.has(project.id)}
                        onSelect={() => toggleSelection(project.id)}
                        actions={
                          <div className="flex items-center gap-1">
                            <ActionButton
                              icon={Edit}
                              label="Modifica progetto"
                              variant="edit"
                              href={`/admin/progetti/${project.id}/modifica`}
                            />
                            <ActionButton
                              icon={Eye}
                              label="Visualizza progetto"
                              variant="view"
                              href={`/progetti/${project.slug}`}
                              target="_blank"
                            />
                            <div className="relative">
                              <ActionButton
                                icon={MoreVertical}
                                label="Menu azioni"
                                variant="menu"
                                onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                              />
                              {openMenuId === project.id && (
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
                                        togglePublishMutation.mutate({ id: project.id });
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      {project.isPublished ? (
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
                                    <button
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                      onClick={() => {
                                        toggleFeaturedMutation.mutate({ id: project.id });
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      {project.isFeatured ? (
                                        <>
                                          <Star className="w-5 h-5 text-slate-500" />
                                          Rimuovi evidenza
                                        </>
                                      ) : (
                                        <>
                                          <Star className="w-5 h-5 text-amber-500" />
                                          Metti in evidenza
                                        </>
                                      )}
                                    </button>
                                    <div className="h-px bg-border" />
                                    <button
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
                                      onClick={() => {
                                        setDeleteId(project.id);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                      Elimina progetto
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </div>
                          </div>
                        }
                      />
                    );
                  })}
                </div>

                {/* Table View - Desktop only */}
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
                          Progetto
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Settore
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Paese
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Lingue
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data?.items.map((project: ProjectItem, index: number) => {
                        const translation = getTranslation(project.translations);
                        return (
                          <motion.tr
                            key={project.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`hover:bg-slate-100/30 transition-colors group ${selectedIds.has(project.id) ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleSelection(project.id)}
                                className={`p-1 rounded-lg transition-all ${
                                  selectedIds.has(project.id) ? 'text-primary' : 'text-slate-400 hover:text-primary'
                                }`}
                              >
                                {selectedIds.has(project.id) ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-primary/30 transition-colors">
                                  {project.featuredImage ? (
                                    <img
                                      src={project.featuredImage}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FolderKanban className="w-5 h-5 text-slate-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                                      {translation?.title || 'Senza titolo'}
                                    </p>
                                    {project.isFeatured && (
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    /{project.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge variant="purple">
                                {SECTOR_LABELS[project.sector] || project.sector}
                              </StatusBadge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                {COUNTRY_LABELS[project.country] || project.country}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {project.isPublished ? (
                                <StatusBadge variant="success" icon={CheckCircle}>
                                  Pubblicato
                                </StatusBadge>
                              ) : (
                                <StatusBadge variant="default" icon={XCircle}>
                                  Bozza
                                </StatusBadge>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {project.translations.map((trans: (typeof project.translations)[number]) => (
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
                              <div className="relative flex items-center justify-end gap-1">
                                <ActionButton
                                  icon={Edit}
                                  label="Modifica progetto"
                                  variant="edit"
                                  href={`/admin/progetti/${project.id}/modifica`}
                                />
                                <ActionButton
                                  icon={Eye}
                                  label="Visualizza progetto"
                                  variant="view"
                                  href={`/progetti/${project.slug}`}
                                  target="_blank"
                                />
                                <div className="relative">
                                  <ActionButton
                                    icon={MoreVertical}
                                    label="Menu azioni"
                                    variant="menu"
                                    onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                                  />
                                  {openMenuId === project.id && (
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
                                            togglePublishMutation.mutate({ id: project.id });
                                            setOpenMenuId(null);
                                          }}
                                        >
                                          {project.isPublished ? (
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
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                          onClick={() => {
                                            toggleFeaturedMutation.mutate({ id: project.id });
                                            setOpenMenuId(null);
                                          }}
                                        >
                                          {project.isFeatured ? (
                                            <>
                                              <Star className="w-5 h-5 text-slate-500" />
                                              Rimuovi evidenza
                                            </>
                                          ) : (
                                            <>
                                              <Star className="w-5 h-5 text-amber-500" />
                                              Metti in evidenza
                                            </>
                                          )}
                                        </button>
                                        <div className="h-px bg-border" />
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
                                          onClick={() => {
                                            setDeleteId(project.id);
                                            setOpenMenuId(null);
                                          }}
                                        >
                                          <Trash2 className="w-5 h-5" />
                                          Elimina progetto
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
            )}

            {/* Empty State */}
            {!isLoading && data?.items.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderKanban className="w-8 h-8 text-slate-500/50" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessun progetto trovato</h3>
                <p className="text-slate-500 mb-6">Inizia creando il tuo primo progetto</p>
                <Link href="/admin/progetti/nuovo">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25"
                  >
                    <Plus className="w-5 h-5" />
                    Crea il primo progetto
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
                  <span className="text-slate-500/70 ml-2">({data.pagination.total} progetti)</span>
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
            <AlertDialogTitle className="text-slate-800">Elimina progetto</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non puo essere annullata. Il progetto verra eliminato permanentemente insieme a tutte le sue traduzioni.
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
            <AlertDialogTitle className="text-slate-800">Elimina {selectedIds.size} progetti</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non puo essere annullata. I progetti selezionati verranno eliminati permanentemente.
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
                `Elimina ${selectedIds.size} progetti`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
