'use client';

import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import {
  FileText,
  FolderOpen,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Download,
  Loader2,
  XCircle,
} from 'lucide-react';

interface RecentDocument {
  id: string;
  name: string;
  type: string;
  date: Date | string;
}

interface RecentApplication {
  id: string;
  name: string;
  status: string;
  deadline: Date | string;
  createdAt: Date | string;
}

interface Notification {
  id: string;
  message: string;
  time: Date | string;
  read: boolean;
  link: string | null;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-slate-100 text-slate-700',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  DRAFT: Clock,
  SUBMITTED: Clock,
  UNDER_REVIEW: AlertCircle,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  WITHDRAWN: XCircle,
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Bozza',
  SUBMITTED: 'Inviata',
  UNDER_REVIEW: 'In revisione',
  APPROVED: 'Approvata',
  REJECTED: 'Rifiutata',
  WITHDRAWN: 'Ritirata',
};

const categoryLabels: Record<string, string> = {
  CONTRACT: 'Contratto',
  REPORT: 'Report',
  CERTIFICATE: 'Certificato',
  PRESENTATION: 'Presentazione',
  APPLICATION: 'Candidatura',
  OTHER: 'Altro',
};

export default function PortalDashboard() {
  const { data: session } = useSession();
  const t = useTranslations('portal');
  const locale = useLocale();

  const { data, isLoading } = trpc.portal.getDashboardStats.useQuery({
    locale,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats;
  const recentDocuments = data?.recentDocuments || [];
  const recentApplications = data?.recentApplications || [];
  const notifications = data?.notifications || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          {t('dashboard.welcome', { name: session?.user?.name || 'Utente' })}
        </h1>
        <p className="text-[15px] text-slate-500 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalDocuments || 0}</p>
              <p className="text-[14px] text-slate-500">{t('dashboard.stats.documents')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalApplications || 0}</p>
              <p className="text-[14px] text-slate-500">{t('dashboard.stats.applications')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.pendingApplications || 0}</p>
              <p className="text-[14px] text-slate-500">In attesa</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.unreadNotifications || 0}</p>
              <p className="text-[14px] text-slate-500">{t('dashboard.stats.notifications')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent documents */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.recentDocuments')}</h2>
            <Link
              href="/portal/documenti"
              className="text-[14px] text-primary hover:underline flex items-center gap-1"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((doc: RecentDocument) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-[15px]">{doc.name}</p>
                      <p className="text-[13px] text-slate-500">
                        {categoryLabels[doc.type] || doc.type} • {formatDate(doc.date)}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-500/30 mx-auto mb-3" />
                <p className="text-[15px] text-slate-500">Nessun documento disponibile</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent applications */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.recentApplications')}</h2>
            <Link
              href="/portal/candidature"
              className="text-[14px] text-primary hover:underline flex items-center gap-1"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {recentApplications.length > 0 ? (
              recentApplications.map((app: RecentApplication) => {
                const StatusIcon = statusIcons[app.status] || Clock;
                return (
                  <div key={app.id} className="p-4 hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-[15px]">{app.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span className="text-[13px] text-slate-500">
                            Scadenza: {formatDate(app.deadline)}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[13px] font-medium ${statusColors[app.status] || statusColors.DRAFT}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[app.status] || app.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <FolderOpen className="w-12 h-12 text-slate-500/30 mx-auto mb-3" />
                <p className="text-[15px] text-slate-500">Nessuna candidatura attiva</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.notifications')}</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {notifications.length > 0 ? (
            notifications.map((notif: Notification) => (
              <div
                key={notif.id}
                className={`p-4 flex items-center gap-4 hover:bg-slate-100/50 transition-colors ${
                  !notif.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <p className="text-[15px] text-slate-800">{notif.message}</p>
                  <p className="text-[13px] text-slate-500">{formatRelativeTime(notif.time)}</p>
                </div>
                {notif.link && (
                  <Link href={notif.link} className="text-primary text-[14px] hover:underline">
                    Visualizza
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-500/30 mx-auto mb-3" />
              <p className="text-[15px] text-slate-500">Nessuna notifica</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
