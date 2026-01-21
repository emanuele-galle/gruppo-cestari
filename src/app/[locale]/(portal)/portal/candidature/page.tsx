'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  FolderOpen,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  Euro,
  ExternalLink,
  FileText,
  ChevronRight,
  Plus,
  Loader2,
  Edit3,
  Send,
  Trash2,
  RotateCcw,
  MoreVertical,
} from 'lucide-react';

interface Application {
  id: string;
  bandoId: string;
  bandoCode: string;
  bandoTitle: string;
  bandoCloseDate: Date | string | null;
  status: string;
  companyName: string | null;
  projectTitle: string | null;
  projectDescription: string | null;
  requestedAmount: number | null;
  documentsCount: number;
  submittedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: 'Bozza',
    color: 'bg-slate-100 text-slate-700',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Inviata',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'In Revisione',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  APPROVED: {
    label: 'Approvata',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rifiutata',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  WITHDRAWN: {
    label: 'Ritirata',
    color: 'bg-slate-100 text-slate-700',
    icon: XCircle,
  },
};

const filterOptions = [
  { key: 'all', label: 'Tutte' },
  { key: 'SUBMITTED', label: 'Inviate' },
  { key: 'UNDER_REVIEW', label: 'In Revisione' },
  { key: 'APPROVED', label: 'Approvate' },
  { key: 'REJECTED', label: 'Rifiutate' },
  { key: 'DRAFT', label: 'Bozze' },
];

export default function ApplicationsPage() {
  const t = useTranslations('portal.applications');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: applications, isLoading } = trpc.portal.getMyApplications.useQuery({
    locale,
    status: statusFilter !== 'all' ? statusFilter as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' : undefined,
    search: searchQuery || undefined,
  });

  const submitMutation = trpc.portal.submitApplication.useMutation({
    onSuccess: () => {
      toast.success('Candidatura inviata con successo!');
      utils.portal.getMyApplications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'invio');
    },
  });

  const withdrawMutation = trpc.portal.withdrawApplication.useMutation({
    onSuccess: () => {
      toast.success('Candidatura ritirata');
      utils.portal.getMyApplications.invalidate();
      setConfirmWithdrawId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il ritiro');
    },
  });

  const deleteMutation = trpc.portal.deleteApplication.useMutation({
    onSuccess: () => {
      toast.success('Bozza eliminata');
      utils.portal.getMyApplications.invalidate();
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Fino a esaurimento fondi';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/D';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (id: string) => {
    if (confirm('Sei sicuro di voler inviare questa candidatura? Una volta inviata non potrà più essere modificata.')) {
      submitMutation.mutate({ id });
    }
  };

  const handleWithdraw = (id: string) => {
    setConfirmWithdrawId(id);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setOpenMenuId(null);
  };

  const stats = applications ? {
    total: applications.length,
    pending: applications.filter((a: Application) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length,
    approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
    draft: applications.filter((a: Application) => a.status === 'DRAFT').length,
  } : { total: 0, pending: 0, approved: 0, draft: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Modals */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Elimina Bozza</h3>
            <p className="text-slate-600 mb-6">
              Sei sicuro di voler eliminare questa bozza? L'azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: confirmDeleteId })}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmWithdrawId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Ritira Candidatura</h3>
            <p className="text-slate-600 mb-6">
              Sei sicuro di voler ritirare questa candidatura? Potrai comunque visualizzarla nello storico.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmWithdrawId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => withdrawMutation.mutate({ id: confirmWithdrawId })}
                disabled={withdrawMutation.isPending}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {withdrawMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Ritira
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{t('title')}</h1>
          <p className="text-[15px] text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href="/portal/candidature/nuova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newApplication')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-[14px] text-slate-500">{t('stats.total')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
          <p className="text-[14px] text-slate-500">{t('stats.pending')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.approved}</p>
          <p className="text-[14px] text-slate-500">{t('stats.approved')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.draft}</p>
          <p className="text-[14px] text-slate-500">Bozze</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
          >
            {filterOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications list */}
      {!applications || applications.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-[15px] text-slate-500">{t('noApplications')}</p>
          <Link
            href="/portal/candidature/nuova"
            className="inline-flex items-center gap-2 mt-4 text-[15px] text-primary hover:underline"
          >
            {t('browseBandi')}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {applications.map((app: Application) => {
            const status = statusConfig[app.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === app.id;
            const isDraft = app.status === 'DRAFT';
            const isSubmitted = app.status === 'SUBMITTED';
            const isUnderReview = app.status === 'UNDER_REVIEW';
            const canEdit = isDraft;
            const canSubmit = isDraft;
            const canWithdraw = isSubmitted || isUnderReview;
            const canDelete = isDraft;

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-slate-100/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[16px] font-semibold text-slate-800 truncate">
                          {app.bandoTitle}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[13px] font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[14px] text-slate-500 mb-2 line-clamp-1">
                        {app.projectTitle || 'Nessun titolo progetto'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[14px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {app.submittedAt
                              ? `Inviata: ${formatDate(app.submittedAt)}`
                              : `Creata: ${formatDate(app.createdAt)}`
                            }
                          </span>
                        </div>
                        {app.requestedAmount && (
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            <span>{formatCurrency(app.requestedAmount)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{app.documentsCount} documenti</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick actions */}
                      {(canEdit || canSubmit || canWithdraw || canDelete) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === app.id ? null : app.id);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-500" />
                          </button>
                          {openMenuId === app.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                                {canEdit && (
                                  <Link
                                    href={`/portal/candidature/${app.id}/modifica`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[14px] text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Modifica
                                  </Link>
                                )}
                                {canSubmit && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      handleSubmit(app.id);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[14px] text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  >
                                    <Send className="w-4 h-4" />
                                    Invia Candidatura
                                  </button>
                                )}
                                {canWithdraw && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWithdraw(app.id);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[14px] text-amber-700 hover:bg-amber-50 transition-colors"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    Ritira
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(app.id);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Elimina Bozza
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <ChevronRight
                        className={`w-5 h-5 text-slate-500 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200"
                  >
                    <div className="p-6 bg-slate-100/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[15px] font-medium text-slate-800 mb-2">
                            {t('details.info')}
                          </h4>
                          <dl className="space-y-2 text-[14px]">
                            <div className="flex justify-between">
                              <dt className="text-slate-500">Codice Bando</dt>
                              <dd className="text-slate-800 font-mono">{app.bandoCode}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-slate-500">{t('details.deadline')}</dt>
                              <dd className="text-slate-800">{formatDate(app.bandoCloseDate)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-slate-500">{t('details.lastUpdate')}</dt>
                              <dd className="text-slate-800">{formatDate(app.updatedAt)}</dd>
                            </div>
                            {app.requestedAmount && (
                              <div className="flex justify-between">
                                <dt className="text-slate-500">{t('details.amount')}</dt>
                                <dd className="text-slate-800 font-medium">{formatCurrency(app.requestedAmount)}</dd>
                              </div>
                            )}
                            {app.companyName && (
                              <div className="flex justify-between">
                                <dt className="text-slate-500">Azienda</dt>
                                <dd className="text-slate-800">{app.companyName}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-slate-800 mb-2">
                            Descrizione Progetto
                          </h4>
                          <p className="text-[14px] text-slate-500 line-clamp-4">
                            {app.projectDescription || 'Nessuna descrizione'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-200">
                        <Link
                          href={`/bandi/${app.bandoCode}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-[14px] text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t('actions.viewBando')}
                        </Link>
                        <Link
                          href="/portal/documenti"
                          className="inline-flex items-center gap-2 px-4 py-2 text-[14px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          {t('actions.viewDocuments')}
                        </Link>
                        {canEdit && (
                          <Link
                            href={`/portal/candidature/${app.id}/modifica`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-[14px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Modifica
                          </Link>
                        )}
                        {canSubmit && (
                          <button
                            onClick={() => handleSubmit(app.id)}
                            disabled={submitMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 text-[14px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            Invia
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
