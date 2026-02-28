'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  FileCheck,
  FileClock,
  FileX,
  ClipboardList,
  ExternalLink,
  MoreVertical,
  ArrowUpRight,
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
} from '@/components/admin';

type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

const STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  variant: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple';
  icon: typeof Clock
}> = {
  DRAFT: { label: 'Bozza', variant: 'default', icon: FileClock },
  SUBMITTED: { label: 'Inviata', variant: 'info', icon: FileText },
  UNDER_REVIEW: { label: 'In Revisione', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Approvata', variant: 'success', icon: FileCheck },
  REJECTED: { label: 'Rifiutata', variant: 'danger', icon: FileX },
  WITHDRAWN: { label: 'Ritirata', variant: 'default', icon: XCircle },
};

const STATUS_OPTIONS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'SUBMITTED', label: 'Inviate' },
  { value: 'UNDER_REVIEW', label: 'In Revisione' },
  { value: 'APPROVED', label: 'Approvate' },
  { value: 'REJECTED', label: 'Rifiutate' },
  { value: 'DRAFT', label: 'Bozze' },
  { value: 'WITHDRAWN', label: 'Ritirate' },
];

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

export default function AdminCandidaturePage() {
  const t = useTranslations('admin');
  const locale = useLocale() as 'it' | 'en' | 'fr';

  const [selectedBandoId, setSelectedBandoId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch all bandi for filter dropdown
  const { data: bandiList, isLoading: bandiLoading } = trpc.bandi.list.useQuery({
    page: 1,
    limit: 100,
    locale,
  });

  // Auto-select first bando if none selected
  const effectiveBandoId = selectedBandoId || bandiList?.items?.[0]?.id || '';

  // Fetch applications for selected bando
  const { data: applicationsData, isLoading, refetch } = trpc.bandi.getApplications.useQuery({
    bandoId: effectiveBandoId,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    page,
    limit: 20,
  }, {
    enabled: !!effectiveBandoId,
  });

  // Fetch stats
  const { data: stats } = trpc.bandi.getStats.useQuery();

  // Get selected bando info
  const selectedBando = useMemo(() => {
    return bandiList?.items?.find(b => b.id === effectiveBandoId);
  }, [bandiList, effectiveBandoId]);

  // Update status mutation
  const updateStatusMutation = trpc.bandi.updateApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success('Stato candidatura aggiornato');
      refetch();
      setStatusChangeId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  // Export to CSV
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- existing memo pattern is intentional
  const handleExport = useCallback(() => {
    if (!applicationsData?.items) return;

    const exportData = applicationsData.items.map((app) => ({
      ID: app.id,
      Bando: selectedBando?.code || '',
      Azienda: app.companyName || '',
      Progetto: app.projectTitle || '',
      Email: app.contactEmail || '',
      Telefono: app.contactPhone || '',
      Importo: app.requestedAmount ? Number(app.requestedAmount) : '',
      Stato: STATUS_CONFIG[app.status as ApplicationStatus]?.label || app.status,
      DataInvio: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('it-IT') : '',
      DataCreazione: new Date(app.createdAt).toLocaleDateString('it-IT'),
    }));

    exportToCSV(exportData, {
      filename: generateExportFilename(`candidature-${selectedBando?.code || 'all'}`),
      headers: {
        ID: 'ID',
        Bando: 'Codice Bando',
        Azienda: 'Azienda',
        Progetto: 'Titolo Progetto',
        Email: 'Email',
        Telefono: 'Telefono',
        Importo: 'Importo Richiesto',
        Stato: 'Stato',
        DataInvio: 'Data Invio',
        DataCreazione: 'Data Creazione',
      },
    });

    toast.success(`Esportate ${exportData.length} candidature`);
  }, [applicationsData?.items, selectedBando]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats from current data
  const localStats = useMemo(() => {
    if (!applicationsData?.items) return null;
    const items = applicationsData.items;
    return {
      total: applicationsData.pagination?.total || items.length,
      submitted: items.filter(a => a.status === 'SUBMITTED').length,
      underReview: items.filter(a => a.status === 'UNDER_REVIEW').length,
      approved: items.filter(a => a.status === 'APPROVED').length,
      rejected: items.filter(a => a.status === 'REJECTED').length,
    };
  }, [applicationsData]);

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
          title="Candidature"
          description="Gestisci le candidature ricevute per i bandi"
          badge={{
            label: `${applicationsData?.pagination?.total || 0} totali`,
            variant: 'purple'
          }}
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              disabled={!applicationsData?.items?.length}
              className="p-2.5 text-slate-500 hover:text-emerald-600 bg-slate-100/50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Totali"
          value={localStats?.total ?? 0}
          icon={ClipboardList}
          color="purple"
        />
        <StatsCard
          title="Inviate"
          value={localStats?.submitted ?? 0}
          icon={Mail}
          color="blue"
        />
        <StatsCard
          title="In Revisione"
          value={localStats?.underReview ?? 0}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Approvate"
          value={localStats?.approved ?? 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Rifiutate"
          value={localStats?.rejected ?? 0}
          icon={XCircle}
          color="red"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Bando Filter */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={effectiveBandoId}
                  onChange={(e) => {
                    setSelectedBandoId(e.target.value);
                    setPage(1);
                  }}
                  disabled={bandiLoading}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                >
                  {bandiLoading ? (
                    <option>Caricamento bandi...</option>
                  ) : (
                    bandiList?.items?.map((bando) => (
                      <option key={bando.id} value={bando.id}>
                        {bando.code} - {bando.translations?.[0]?.title?.slice(0, 40) || 'Senza titolo'}...
                      </option>
                    ))
                  )}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[180px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as ApplicationStatus | 'all');
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
              </div>

              {/* Link to Bando */}
              {selectedBando && (
                <Link
                  href={`/admin/bandi/${selectedBando.id}/modifica`}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  Vai al bando
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={itemVariants}>
        {isLoading || bandiLoading ? (
          <Card variant="gradient">
            <CardContent className="p-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-slate-500">Caricamento candidature...</span>
              </div>
            </CardContent>
          </Card>
        ) : !effectiveBandoId ? (
          <Card variant="gradient">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-500/50" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessun bando disponibile</h3>
              <p className="text-slate-500">Crea prima un bando per poter gestire le candidature</p>
              <Link href="/admin/bandi/nuovo">
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
                  Crea nuovo bando
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : applicationsData?.items?.length === 0 ? (
          <Card variant="gradient">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-slate-500/50" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessuna candidatura</h3>
              <p className="text-slate-500">
                {selectedStatus !== 'all'
                  ? `Non ci sono candidature con stato "${STATUS_CONFIG[selectedStatus as ApplicationStatus]?.label || selectedStatus}"`
                  : 'Non sono ancora state ricevute candidature per questo bando'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applicationsData?.items?.map((app, index) => {
              const statusConfig = STATUS_CONFIG[app.status as ApplicationStatus];
              const StatusIcon = statusConfig?.icon || FileText;
              const isExpanded = expandedId === app.id;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <Card variant="bordered" className="hover:border-primary/30 transition-all overflow-hidden">
                    <CardContent className="p-0">
                      {/* Main Row */}
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      >
                        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                          {/* Left: Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-800 line-clamp-1">
                                  {app.companyName || 'Azienda non specificata'}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                                  {app.projectTitle || 'Progetto senza titolo'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <StatusBadge
                                    variant={statusConfig?.variant || 'default'}
                                    icon={StatusIcon}
                                  >
                                    {statusConfig?.label || app.status}
                                  </StatusBadge>
                                  {app.contactEmail && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {app.contactEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Center: Stats */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-slate-100/50 rounded-xl px-4 py-2.5 border border-slate-200 min-w-[100px]">
                              <div className="flex items-center gap-1.5 text-base font-bold text-slate-800">
                                <Euro className="w-4 h-4 text-emerald-600" />
                                {formatCurrency(app.requestedAmount ? Number(app.requestedAmount) : null)}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Richiesto</p>
                            </div>
                            <div className="bg-slate-100/50 rounded-xl px-4 py-2.5 border border-slate-200 min-w-[80px]">
                              <div className="flex items-center gap-1.5 text-base font-bold text-slate-800">
                                <FileText className="w-4 h-4 text-blue-600" />
                                {app.documents?.length || 0}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Documenti</p>
                            </div>
                            <div className="bg-slate-100/50 rounded-xl px-4 py-2.5 border border-slate-200 min-w-[100px]">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                                <CalendarDays className="w-4 h-4 text-purple-600" />
                                {app.submittedAt
                                  ? new Date(app.submittedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                                  : 'Non inviata'}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Data invio</p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusChangeId(app.id);
                                setNewStatus(app.status as ApplicationStatus);
                              }}
                              className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all"
                            >
                              Cambia Stato
                            </motion.button>
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                              <div className="grid md:grid-cols-2 gap-6 pt-4">
                                {/* Contact Info */}
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Informazioni Contatto
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <Mail className="w-4 h-4 text-slate-400" />
                                      {app.contactEmail || '-'}
                                    </div>
                                    {app.contactPhone && (
                                      <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {app.contactPhone}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <CalendarDays className="w-4 h-4 text-slate-400" />
                                      Creata: {new Date(app.createdAt).toLocaleDateString('it-IT', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Project Info */}
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Dettagli Progetto
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {app.projectDescription && (
                                      <p className="text-slate-600 line-clamp-3">
                                        {app.projectDescription}
                                      </p>
                                    )}
                                    {app.notes && (
                                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Note:</p>
                                        <p className="text-slate-600 text-sm">{app.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              {app.documents && app.documents.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                    Documenti Allegati ({app.documents.length})
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {app.documents.map((doc: { id: string; name: string; url: string }) => (
                                      <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                                      >
                                        <FileText className="w-4 h-4" />
                                        {doc.name}
                                        <ArrowUpRight className="w-3 h-3" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {applicationsData && applicationsData.pagination && applicationsData.pagination.totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Pagina <span className="font-semibold text-slate-800">{page}</span> di{' '}
                <span className="font-semibold text-slate-800">{applicationsData.pagination.totalPages}</span>
                {' '}({applicationsData.pagination.total} risultati)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Precedente
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(applicationsData.pagination.totalPages, p + 1))}
                  disabled={page === applicationsData.pagination.totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Successivo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Status Change Dialog */}
      <AlertDialog open={!!statusChangeId} onOpenChange={() => setStatusChangeId(null)}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">Cambia stato candidatura</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Seleziona il nuovo stato per questa candidatura
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-800"
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => statusChangeId && updateStatusMutation.mutate({
                applicationId: statusChangeId,
                status: newStatus
              })}
              disabled={updateStatusMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Aggiorna'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
