'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users,
  FileText,
  Newspaper,
  Mail,
  TrendingUp,
  Eye,
  Clock,
  AlertCircle,
  ArrowRight,
  Calendar,
  Loader2,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Target,
  Star,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardHeader, CardContent } from '@/components/admin/card';
import { QuickActions, type QuickAction } from '@/components/admin/quick-actions';
import { ActivityFeed, type ActivityItem } from '@/components/admin/activity-feed';
import { SimpleBarChart } from '@/components/admin/chart-placeholder';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { trpc } from '@/lib/trpc';

// Stats data type inferred from tRPC
type StatsData = {
  overview: {
    news: { total: number; published: number; draft: number };
    bandi: { total: number; active: number; expired: number };
    contacts: { total: number; new: number; trend: number };
    newsletter: { total: number; active: number; trend: number };
  };
  recentActivity: {
    contacts: Array<{
      id: string;
      name: string;
      email: string;
      subject: string | null;
      status: string;
      date: Date;
    }>;
    news: Array<{
      id: string;
      title: string;
      slug: string;
      published: boolean;
      date: Date;
    }>;
  };
};

const quickActions: QuickAction[] = [
  { label: 'Nuovo articolo', description: 'Crea una news', href: '/admin/news/nuovo', icon: Newspaper, color: 'green' },
  { label: 'Nuovo bando', description: 'Pubblica un bando', href: '/admin/bandi/nuovo', icon: FileText, color: 'purple' },
  { label: 'Gestisci utenti', description: 'Modifica utenti', href: '/admin/utenti', icon: Users, color: 'orange' },
  { label: 'Vedi contatti', description: 'Messaggi ricevuti', href: '/admin/contatti', icon: Mail, color: 'red' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  // Fetch stats using tRPC (protected by adminProcedure)
  const { data: stats, isLoading: loading, error: queryError } = trpc.admin.getStats.useQuery();
  const error = queryError?.message || null;

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m fa`;
    if (hours < 24) return `${hours}h fa`;
    if (days < 7) return `${days}g fa`;
    return date.toLocaleDateString('it-IT');
  };

  // Convert recent contacts to activity items
  const activityItems: ActivityItem[] = (stats?.recentActivity.contacts || []).map((contact) => ({
    id: contact.id,
    icon: Mail,
    iconColor: (contact.status === 'NEW' ? 'blue' : contact.status === 'READ' ? 'yellow' : 'green') as 'blue' | 'yellow' | 'green',
    title: contact.name,
    description: contact.subject || contact.email,
    meta: formatDate(contact.date),
    badge: {
      text: contact.status === 'NEW' ? 'Nuovo' : contact.status === 'READ' ? 'Letto' : 'Risposto',
      variant: (contact.status === 'NEW' ? 'info' : contact.status === 'READ' ? 'warning' : 'success') as 'info' | 'warning' | 'success',
    },
  }));

  // Chart data for simple visualization
  const chartData = [
    { label: 'Gen', value: 12 },
    { label: 'Feb', value: 19 },
    { label: 'Mar', value: 15 },
    { label: 'Apr', value: 25 },
    { label: 'Mag', value: 22 },
    { label: 'Giu', value: 30 },
    { label: 'Lug', value: 28 },
    { label: 'Ago', value: 18 },
    { label: 'Set', value: 35 },
    { label: 'Ott', value: 42 },
    { label: 'Nov', value: 38 },
    { label: 'Dic', value: 45 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-slate-500 text-sm mt-1">Riprova più tardi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          badge={{ text: 'Live', variant: 'success' }}
        >
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </PageHeader>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/10 to-pink-500/10 border border-primary/20 p-6 md:p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Dashboard Overview
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Benvenuto nel pannello di controllo
            </h2>
            <p className="text-slate-500 max-w-2xl">
              Gestisci contenuti, utenti e bandi del sito Gruppo Cestari.
              Monitora le statistiche e rispondi ai contatti.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Articoli News"
          value={stats?.overview.news.total || 0}
          subtitle={`${stats?.overview.news.published || 0} pubblicati`}
          icon={Newspaper}
          color="green"
          delay={0}
        />
        <StatsCard
          title="Bandi Attivi"
          value={stats?.overview.bandi.total || 0}
          subtitle={`${stats?.overview.bandi.active || 0} attivi ora`}
          icon={FileText}
          color="purple"
          trend={{ value: 12 }}
          delay={0.1}
        />
        <StatsCard
          title="Contatti"
          value={stats?.overview.contacts.total || 0}
          subtitle={`${stats?.overview.contacts.new || 0} nuovi (30gg)`}
          icon={Mail}
          color="orange"
          trend={{ value: stats?.overview.contacts.trend || 0 }}
          delay={0.2}
        />
        <StatsCard
          title="Newsletter"
          value={stats?.overview.newsletter.total || 0}
          subtitle={`${stats?.overview.newsletter.active || 0} iscritti attivi`}
          icon={Users}
          color="blue"
          trend={{ value: stats?.overview.newsletter.trend || 0 }}
          delay={0.3}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card variant="glass" padding="md">
          <CardHeader
            title="Azioni Rapide"
            description="Accedi velocemente alle funzionalità principali"
            icon={<Zap className="w-5 h-5" />}
          />
          <CardContent>
            <QuickActions actions={quickActions} columns={4} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card variant="gradient" padding="md" className="h-full">
            <CardHeader
              title="Ultimi Contatti"
              description="Messaggi ricevuti di recente"
              icon={<Activity className="w-5 h-5" />}
              action={
                <Link
                  href="/admin/contatti"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Vedi tutti <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <CardContent>
              {activityItems.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
                  <p className="text-slate-500">Nessun contatto recente</p>
                </div>
              ) : (
                <ActivityFeed items={activityItems} maxItems={5} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent News */}
        <motion.div variants={item}>
          <Card variant="gradient" padding="md" className="h-full">
            <CardHeader
              title="Ultime News"
              description="Articoli pubblicati"
              icon={<Newspaper className="w-5 h-5" />}
              action={
                <Link
                  href="/admin/news"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Vedi tutte <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {stats?.recentActivity.news.length === 0 ? (
                  <div className="text-center py-8">
                    <Newspaper className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
                    <p className="text-slate-500">Nessuna news recente</p>
                    <Link
                      href="/admin/news/nuovo"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Crea il primo articolo
                    </Link>
                  </div>
                ) : (
                  stats?.recentActivity.news.map((news) => (
                    <Link
                      key={news.id}
                      href={`/admin/news/${news.id}/modifica`}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 hover:bg-slate-100 transition-all duration-200"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        news.published ? 'bg-emerald-500' : 'bg-amber-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800/80 truncate group-hover:text-slate-800 transition-colors">
                          {news?.title ?? 'Senza titolo'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(news?.date)}</p>
                      </div>
                      <StatusBadge variant={news.published ? 'success' : 'warning'} size="sm">
                        {news.published ? 'Online' : 'Bozza'}
                      </StatusBadge>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Traffic Overview */}
      <motion.div variants={item}>
        <Card variant="glass" padding="md">
          <CardHeader
            title="Panoramica Traffico"
            description="Visualizzazioni e interazioni sul sito"
            icon={<BarChart3 className="w-5 h-5" />}
            action={
              <div className="flex items-center gap-1 bg-slate-100/50 rounded-lg p-1">
                {(['7', '30', '90'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      selectedPeriod === period
                        ? 'bg-primary text-white'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    )}
                  >
                    {period}g
                  </button>
                ))}
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Mini Stats */}
              <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    +24%
                  </div>
                  <p className="text-2xl font-bold text-slate-800">12.5k</p>
                  <p className="text-xs text-slate-500">Visite totali</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
                    <Eye className="w-4 h-4" />
                    1.2k
                  </div>
                  <p className="text-2xl font-bold text-slate-800">4.8k</p>
                  <p className="text-xs text-slate-500">Pagine viste</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-1">
                    <Target className="w-4 h-4" />
                    68%
                  </div>
                  <p className="text-2xl font-bold text-slate-800">2:34</p>
                  <p className="text-xs text-slate-500">Tempo medio</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-1">
                    <Star className="w-4 h-4" />
                    92%
                  </div>
                  <p className="text-2xl font-bold text-slate-800">4.8/5</p>
                  <p className="text-xs text-slate-500">Soddisfazione</p>
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-3">
                <div className="h-[280px] flex flex-col">
                  <div className="flex-1 flex items-end">
                    <SimpleBarChart data={chartData} height={220} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row - Coming Soon Features */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg" hover>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Analytics Avanzate</h3>
              <p className="text-sm text-slate-500 mb-3">
                Integrazione con Google Analytics per metriche dettagliate e report personalizzati.
              </p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-600 rounded-full border border-cyan-500/20">
                <Clock className="w-3 h-3" />
                In arrivo
              </span>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg" hover>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Automazioni</h3>
              <p className="text-sm text-slate-500 mb-3">
                Workflow automatici per notifiche, backup e gestione contenuti programmata.
              </p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-full border border-purple-500/20">
                <Clock className="w-3 h-3" />
                In arrivo
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
