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
  Euro,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  TrendingUp,
  Globe,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  BulkActionsBar,
  bulkActionPresets,
  ActionButton,
} from '@/components/admin';

type BandoType = 'EUROPEAN' | 'NATIONAL' | 'REGIONAL' | 'PRIVATE';
type BandoStatus = 'open' | 'closed' | 'upcoming' | 'all';

const BANDO_TYPES: { value: BandoType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tutti i tipi' },
  { value: 'EUROPEAN', label: 'Europeo' },
  { value: 'NATIONAL', label: 'Nazionale' },
  { value: 'REGIONAL', label: 'Regionale' },
  { value: 'PRIVATE', label: 'Privato' },
];

const TYPE_BADGES: Record<BandoType, { variant: 'info' | 'purple' | 'cyan' | 'warning'; icon: typeof Globe }> = {
  EUROPEAN: { variant: 'info', icon: Globe },
  NATIONAL: { variant: 'purple', icon: Target },
  REGIONAL: { variant: 'cyan', icon: Target },
  PRIVATE: { variant: 'warning', icon: Sparkles },
};

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

export default function AdminBandiPage() {
  const t = useTranslations('admin.bandi');
  const locale = useLocale() as 'it' | 'en' | 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<BandoType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<BandoStatus>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'openDate' | 'closeDate' | 'fundingAmount'>('closeDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Fetch bandi
  const { data, isLoading, refetch } = trpc.bandi.list.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    type: selectedType === 'all' ? undefined : selectedType,
    status: selectedStatus,
    locale,
    sortBy,
    sortOrder,
  });

  // Fetch stats
  const { data: stats } = trpc.bandi.getStats.useQuery();

  // Delete mutation
  const deleteMutation = trpc.bandi.delete.useMutation({
    onSuccess: () => {
      toast.success('Bando eliminato con successo');
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = trpc.bandi.togglePublish.useMutation({
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
    toast.success(`${successCount} bandi pubblicati`);
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
    toast.success(`${successCount} bandi eliminati`);
    clearSelection();
    setBulkDeleteOpen(false);
    refetch();
  }, [selectedIds, deleteMutation, clearSelection, refetch]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (!data?.items) return;

    const exportData = data.items
      .filter((item) => selectedIds.size === 0 || selectedIds.has(item.id))
      .map((bando) => {
        const translation = getTranslation(bando.translations);
        return {
          Codice: bando.code,
          Titolo: translation?.title || '',
          Tipo: bando.type,
          Importo: bando.fundingAmount ? Number(bando.fundingAmount) : '',
          Valuta: bando.fundingCurrency,
          DataApertura: new Date(bando.openDate).toLocaleDateString('it-IT'),
          DataScadenza: bando.untilFundsExhausted ? 'Fino a esaurimento fondi' : bando.closeDate ? new Date(bando.closeDate).toLocaleDateString('it-IT') : '',
          Pubblicato: bando.isPublished ? 'Sì' : 'No',
          Candidature: bando._count.applications,
        };
      });

    exportToCSV(exportData, {
      filename: generateExportFilename('bandi'),
      headers: {
        Codice: 'Codice',
        Titolo: 'Titolo',
        Tipo: 'Tipo',
        Importo: 'Importo',
        Valuta: 'Valuta',
        DataApertura: 'Data Apertura',
        DataScadenza: 'Data Scadenza',
        Pubblicato: 'Pubblicato',
        Candidature: 'Candidature',
      },
    });

    toast.success(`Esportati ${exportData.length} bandi`);
  }, [data?.items, selectedIds]);

  const getDaysRemaining = (closeDate: Date | null, untilFundsExhausted?: boolean) => {
    if (untilFundsExhausted || !closeDate) return null;
    const now = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTranslation = (translations: { locale: string; title: string }[]) => {
    return translations.find((t) => t.locale === locale) || translations[0];
  };

  const formatCurrency = (amount: number | null | undefined, currency: string) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBandoStatusInfo = (isPublished: boolean, openDate: Date, closeDate: Date | null, untilFundsExhausted?: boolean) => {
    const now = new Date();
    const open = new Date(openDate);

    if (!isPublished) {
      return { variant: 'default' as const, label: 'Bozza', icon: Clock };
    }
    if (open > now) {
      return { variant: 'info' as const, label: 'In Arrivo', icon: Clock };
    }
    // If "until funds exhausted", it's always open once started
    if (untilFundsExhausted) {
      return { variant: 'success' as const, label: 'Aperto', icon: CheckCircle };
    }
    if (closeDate) {
      const close = new Date(closeDate);
      const daysRemaining = getDaysRemaining(closeDate, untilFundsExhausted);
      if (close < now) {
        return { variant: 'danger' as const, label: 'Chiuso', icon: XCircle };
      }
      if (daysRemaining !== null && daysRemaining <= 7) {
        return { variant: 'warning' as const, label: 'In Scadenza', icon: AlertTriangle };
      }
    }
    return { variant: 'success' as const, label: 'Attivo', icon: CheckCircle };
  };

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
          badge={{ label: `${stats?.total || 0} bandi`, variant: 'purple' }}
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
            <Link href="/admin/bandi/nuovo">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t('newBando')}
              </motion.button>
            </Link>
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Bandi Attivi"
          value={stats?.open ?? 0}
          icon={CheckCircle}
          color="green"
          trend={{ value: 8 }}
        />
        <StatsCard
          title="In Arrivo"
          value={stats?.upcoming ?? 0}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Candidature"
          value={stats?.totalApplications ?? 0}
          icon={Users}
          color="purple"
          trend={{ value: 15 }}
        />
        <StatsCard
          title="Totale Bandi"
          value={stats?.total ?? 0}
          icon={FileText}
          color="cyan"
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

              {/* Type Filter */}
              <div className="relative min-w-[160px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value as BandoType | 'all');
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  {BANDO_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[160px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Target className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as BandoStatus);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="open">Attivi</option>
                  <option value="upcoming">In Arrivo</option>
                  <option value="closed">Chiusi</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="relative min-w-[200px]">
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
                  <option value="closeDate-asc">Scadenza (prossima)</option>
                  <option value="closeDate-desc">Scadenza (lontana)</option>
                  <option value="openDate-desc">Apertura (recente)</option>
                  <option value="openDate-asc">Apertura (vecchia)</option>
                  <option value="createdAt-desc">Creazione (recente)</option>
                  <option value="createdAt-asc">Creazione (vecchia)</option>
                  <option value="fundingAmount-desc">Budget (max)</option>
                  <option value="fundingAmount-asc">Budget (min)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bandi List */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <Card variant="gradient">
            <CardContent className="p-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-slate-500">Caricamento bandi...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.items.map((bando: (typeof data.items)[number], index: number) => {
              const translation = getTranslation(bando.translations);
              const daysRemaining = getDaysRemaining(bando.closeDate, bando.untilFundsExhausted);
              const statusInfo = getBandoStatusInfo(bando.isPublished, bando.openDate, bando.closeDate, bando.untilFundsExhausted);
              const typeInfo = TYPE_BADGES[bando.type as BandoType];

              return (
                <motion.div
                  key={bando.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card variant="bordered" className={`hover:border-primary/30 transition-all ${selectedIds.has(bando.id) ? 'border-primary/50 bg-primary/5' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSelection(bando.id)}
                          className={`p-1 rounded-lg transition-all shrink-0 ${
                            selectedIds.has(bando.id)
                              ? 'text-primary'
                              : 'text-slate-400 hover:text-primary'
                          }`}
                        >
                          {selectedIds.has(bando.id) ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                              <FileText className="w-7 h-7 text-primary" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                                {translation?.title || 'Senza titolo'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <StatusBadge variant={statusInfo.variant} icon={statusInfo.icon}>
                                  {statusInfo.label}
                                </StatusBadge>
                                {typeInfo && (
                                  <StatusBadge variant={typeInfo.variant}>
                                    {bando.type}
                                  </StatusBadge>
                                )}
                                <span className="px-2 py-1 text-xs font-mono bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
                                  {bando.code}
                                </span>
                                <div className="flex items-center gap-1">
                                  {bando.translations.map((trans: (typeof bando.translations)[number]) => (
                                    <span
                                      key={trans.locale}
                                      className="px-2 py-1 text-xs font-bold bg-primary/20 text-primary rounded-lg uppercase"
                                    >
                                      {trans.locale}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Center: Stats */}
                        <div className="flex flex-wrap items-center gap-4 xl:gap-6">
                          {/* Budget */}
                          <div className="bg-slate-100/50 rounded-xl px-4 py-3 border border-slate-200 min-w-[120px]">
                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                              <Euro className="w-4 h-4 text-emerald-600" />
                              {formatCurrency(bando.fundingAmount ? Number(bando.fundingAmount) : null, bando.fundingCurrency)}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Budget</p>
                          </div>

                          {/* Applications */}
                          <div className="bg-slate-100/50 rounded-xl px-4 py-3 border border-slate-200 min-w-[100px]">
                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                              <Users className="w-4 h-4 text-purple-600" />
                              {bando._count.applications}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Candidature</p>
                          </div>

                          {/* Attachments */}
                          <div className="bg-slate-100/50 rounded-xl px-4 py-3 border border-slate-200 min-w-[100px]">
                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                              <Download className="w-4 h-4 text-blue-600" />
                              {bando.attachments.length}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Allegati</p>
                          </div>

                          {/* Deadline */}
                          {bando.untilFundsExhausted ? (
                            <div className="rounded-xl px-4 py-3 border min-w-[120px] bg-blue-500/10 border-blue-500/30">
                              <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                                <Calendar className="w-4 h-4" />
                                Aperto
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Fino a esaurimento fondi
                              </p>
                            </div>
                          ) : (
                            <div className={`rounded-xl px-4 py-3 border min-w-[120px] ${
                              daysRemaining !== null && daysRemaining < 0
                                ? 'bg-red-500/10 border-red-500/30'
                                : daysRemaining !== null && daysRemaining <= 7
                                  ? 'bg-orange-500/10 border-orange-500/30'
                                  : daysRemaining !== null && daysRemaining <= 30
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : 'bg-emerald-500/10 border-emerald-500/30'
                            }`}>
                              <div className={`flex items-center gap-2 text-lg font-bold ${
                                daysRemaining !== null && daysRemaining < 0
                                  ? 'text-red-400'
                                  : daysRemaining !== null && daysRemaining <= 7
                                    ? 'text-orange-400'
                                    : daysRemaining !== null && daysRemaining <= 30
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                              }`}>
                                <Calendar className="w-4 h-4" />
                                {daysRemaining !== null && daysRemaining < 0 ? 'Scaduto' : `${daysRemaining}g`}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {bando.closeDate && new Date(bando.closeDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 xl:ml-2">
                          <ActionButton
                            icon={Edit}
                            label="Modifica bando"
                            variant="edit"
                            href={`/admin/bandi/${bando.id}/modifica`}
                          />
                          <ActionButton
                            icon={Eye}
                            label="Visualizza bando"
                            variant="view"
                            href={`/bandi/${bando.code}`}
                            target="_blank"
                          />
                          <div className="relative">
                            <ActionButton
                              icon={MoreVertical}
                              label="Menu azioni"
                              variant="menu"
                              onClick={() => setOpenMenuId(openMenuId === bando.id ? null : bando.id)}
                            />
                            {openMenuId === bando.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-32px)] bg-white rounded-xl border border-slate-200 shadow-xl shadow-black/20 z-50 overflow-hidden"
                                >
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                    onClick={() => {
                                      togglePublishMutation.mutate({ id: bando.id });
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    {bando.isPublished ? (
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
                                      setDeleteId(bando.id);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                    Elimina bando
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Empty State */}
            {data?.items.length === 0 && (
              <Card variant="gradient">
                <CardContent className="p-16 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-500/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessun bando trovato</h3>
                  <p className="text-slate-500 mb-6">Inizia creando il tuo primo bando</p>
                  <Link href="/admin/bandi/nuovo">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25"
                    >
                      <Plus className="w-5 h-5" />
                      Crea il primo bando
                    </motion.button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Pagina <span className="font-semibold text-slate-800">{data.pagination.page}</span> di{' '}
                <span className="font-semibold text-slate-800">{data.pagination.totalPages}</span>
                <span className="text-slate-500/70 ml-2">({data.pagination.total} bandi)</span>
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Successivo
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
            <AlertDialogTitle className="text-slate-800">Elimina bando</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non può essere annullata. Il bando verrà eliminato permanentemente solo se non ha candidature associate.
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
            <AlertDialogTitle className="text-slate-800">Elimina {selectedIds.size} bandi</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Questa azione non può essere annullata. I bandi selezionati verranno eliminati permanentemente.
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
                `Elimina ${selectedIds.size} bandi`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
