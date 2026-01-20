'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Reply,
  Download,
  Star,
  StarOff,
  MessageSquare,
  Loader2,
  Archive,
  Filter,
  Inbox,
  Send,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  MoreHorizontal,
  StickyNote,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  PageHeader,
  StatsCard,
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  ActionButton,
} from '@/components/admin';
import { useDebounce } from '@/hooks/use-debounce';

const statuses = ['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const;

const quickFilters = [
  { key: 'ALL', label: 'Tutti', icon: Inbox },
  { key: 'NEW', label: 'Nuovi', icon: Mail },
  { key: 'STARRED', label: 'Preferiti', icon: Star },
  { key: 'READ', label: 'Da rispondere', icon: Clock },
  { key: 'REPLIED', label: 'Risposti', icon: CheckCircle },
  { key: 'ARCHIVED', label: 'Archiviati', icon: Archive },
] as const;

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

export default function AdminContattiPage() {
  const t = useTranslations('admin.contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Admin notes state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);

  const utils = trpc.useUtils();

  // Determine query params based on filter
  const queryParams = useMemo(() => {
    const base = {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    };

    if (selectedFilter === 'ALL') {
      return base;
    } else if (selectedFilter === 'STARRED') {
      return { ...base, starred: true };
    } else {
      return { ...base, status: selectedFilter as 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED' };
    }
  }, [page, debouncedSearch, selectedFilter]);

  // Fetch contacts
  const { data, isLoading, isFetching } = trpc.contacts.list.useQuery(queryParams);

  // Fetch stats
  const { data: stats } = trpc.contacts.getStats.useQuery();

  // Search loading indicator
  useEffect(() => {
    if (searchQuery !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearch]);

  // Mutations
  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      utils.contacts.getStats.invalidate();
      toast.success('Stato aggiornato');
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  const toggleStarMutation = trpc.contacts.toggleStar.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      utils.contacts.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore');
    },
  });

  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      utils.contacts.getStats.invalidate();
      setSelectedContact(null);
      setIsMobileDetailOpen(false);
      toast.success('Messaggio eliminato');
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  const bulkArchiveMutation = trpc.contacts.bulkArchive.useMutation({
    onSuccess: (data) => {
      utils.contacts.list.invalidate();
      utils.contacts.getStats.invalidate();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      toast.success(`${data.count} messaggi archiviati`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'archiviazione');
    },
  });

  const bulkDeleteMutation = trpc.contacts.bulkDelete.useMutation({
    onSuccess: (data) => {
      utils.contacts.list.invalidate();
      utils.contacts.getStats.invalidate();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      toast.success(`${data.count} messaggi eliminati`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Export CSV handler
  const handleExportCsv = async () => {
    try {
      const result = await utils.contacts.exportCsv.fetch({});
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      toast.success('Export completato');
    } catch {
      toast.error('Errore durante l\'export');
    }
  };

  const contacts = data?.items || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalItems = data?.pagination?.total || 0;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'NEW':
        return { variant: 'info' as const, label: 'Nuovo', icon: Mail };
      case 'READ':
        return { variant: 'warning' as const, label: 'Letto', icon: Eye };
      case 'REPLIED':
        return { variant: 'success' as const, label: 'Risposto', icon: CheckCircle };
      case 'ARCHIVED':
        return { variant: 'default' as const, label: 'Archiviato', icon: Archive };
      default:
        return { variant: 'default' as const, label: status, icon: Mail };
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Ora';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h fa`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}g fa`;
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    }
  };

  const selectedContactData = contacts.find((c: (typeof contacts)[number]) => c.id === selectedContact);

  // Mark as read when selecting a NEW contact
  const handleSelectContact = (contactId: string) => {
    const contact = contacts.find((c: (typeof contacts)[number]) => c.id === contactId);
    setSelectedContact(contactId);
    setIsMobileDetailOpen(true);

    // Reset notes editing
    setEditingNotes(false);
    setNotesValue(contact?.adminNotes || '');

    if (contact && contact.status === 'NEW') {
      updateMutation.mutate({ id: contactId, status: 'READ' });
    }
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
    if (selectedContactData && selectedContactData.status !== 'REPLIED') {
      updateMutation.mutate({ id: selectedContactData.id, status: 'REPLIED' });
    }
  };

  const handleArchive = (id: string) => {
    updateMutation.mutate({ id, status: 'ARCHIVED' });
  };

  const handleSaveNotes = () => {
    if (selectedContactData) {
      updateMutation.mutate(
        { id: selectedContactData.id, adminNotes: notesValue },
        {
          onSuccess: () => {
            setEditingNotes(false);
            toast.success('Note salvate');
          },
        }
      );
    }
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c: (typeof contacts)[number]) => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkArchive = () => {
    if (selectedIds.size > 0) {
      bulkArchiveMutation.mutate({ ids: Array.from(selectedIds) });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      bulkDeleteMutation.mutate({ ids: Array.from(selectedIds) });
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!contacts.length) return;

    const currentIndex = contacts.findIndex((c: (typeof contacts)[number]) => c.id === selectedContact);

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const nextIndex = currentIndex < contacts.length - 1 ? currentIndex + 1 : 0;
      handleSelectContact(contacts[nextIndex].id);
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : contacts.length - 1;
      handleSelectContact(contacts[prevIndex].id);
    } else if (e.key === 'Escape') {
      setSelectedContact(null);
      setIsMobileDetailOpen(false);
    }
  }, [contacts, selectedContact]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update notes value when contact changes
  useEffect(() => {
    if (selectedContactData) {
      setNotesValue(selectedContactData.adminNotes || '');
    }
  }, [selectedContactData?.id]);

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
          badge={{ label: `${stats?.total || 0} messaggi`, variant: 'cyan' }}
        >
          <div className="flex items-center gap-2">
            {/* Toggle Selection Mode */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds(new Set());
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border transition-all ${
                isSelectionMode
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-slate-100/50 text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Seleziona</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100/50 text-slate-800 rounded-xl font-medium border border-slate-200 hover:bg-slate-100 transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">{t('exportContacts')}</span>
            </motion.button>
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Nuovi Messaggi"
          value={stats?.unread || 0}
          icon={Inbox}
          color="blue"
          trend={stats?.unread && stats.unread > 0 ? { value: stats.unread } : undefined}
        />
        <StatsCard
          title="Da Rispondere"
          value={stats?.byStatus?.READ || 0}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Risposti"
          value={stats?.byStatus?.REPLIED || 0}
          icon={Send}
          color="green"
        />
        <StatsCard
          title="Preferiti"
          value={stats?.starred || 0}
          icon={Star}
          color="purple"
        />
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-primary">
                {selectedIds.size} selezionati
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-primary/70 hover:text-primary transition-colors"
              >
                {selectedIds.size === contacts.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkArchive}
                disabled={bulkArchiveMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {bulkArchiveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                Archivia
              </motion.button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </motion.button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-slate-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Eliminare {selectedIds.size} messaggi?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500">
                      Questa azione non può essere annullata. I messaggi verranno eliminati permanentemente.
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
                      {bulkDeleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Elimina tutti'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact List */}
        <div className="space-y-4">
          {/* Quick Filters */}
          <Card variant="glass">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => {
                  const FilterIcon = filter.icon;
                  const isActive = selectedFilter === filter.key;
                  const count = filter.key === 'ALL'
                    ? stats?.total
                    : filter.key === 'STARRED'
                      ? stats?.starred
                      : stats?.byStatus?.[filter.key as keyof typeof stats.byStatus];

                  return (
                    <motion.button
                      key={filter.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedFilter(filter.key);
                        setPage(1);
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-slate-100/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FilterIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{filter.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20' : 'bg-slate-200'
                        }`}>
                          {count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-lg">
                  {isSearching || isFetching ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-500" />
                  )}
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
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <Card variant="gradient">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Messaggi
                </h3>
                <span className="text-sm text-slate-500">
                  {contacts.length} di {totalItems}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-slate-500">Caricamento messaggi...</span>
                  </div>
                </div>
              ) : contacts.length > 0 ? (
                <div className="divide-y divide-border">
                  {contacts.map((contact: (typeof contacts)[number], index: number) => {
                    const statusInfo = getStatusInfo(contact.status);
                    const isSelected = selectedIds.has(contact.id);
                    return (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => !isSelectionMode && handleSelectContact(contact.id)}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedContact === contact.id
                            ? 'bg-primary/10 border-l-4 border-l-primary'
                            : isSelected
                              ? 'bg-primary/5'
                              : contact.status === 'NEW'
                                ? 'bg-blue-500/5 hover:bg-blue-500/10'
                                : 'hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          {isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectOne(contact.id);
                              }}
                              className={`shrink-0 p-1 rounded-lg transition-colors ${
                                isSelected ? 'text-primary' : 'text-slate-400 hover:text-primary'
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          )}

                          {/* Avatar */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              contact.status === 'NEW'
                                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                                : 'bg-gradient-to-br from-muted to-muted/80 border border-slate-200'
                            }`}>
                              <span className={`text-sm font-bold ${
                                contact.status === 'NEW' ? 'text-blue-600' : 'text-slate-500'
                              }`}>
                                {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            {contact.status === 'NEW' && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-card animate-pulse" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${contact.status === 'NEW' ? 'text-slate-800' : 'text-slate-800/80'}`}>
                                  {contact.name}
                                </h3>
                                {contact.isStarred && (
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                )}
                                {contact.adminNotes && (
                                  <StickyNote className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <span className="text-xs text-slate-500/70 shrink-0 ml-2">
                                {formatDateShort(contact.createdAt)}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 line-clamp-1 ${contact.status === 'NEW' ? 'text-slate-800/90 font-medium' : 'text-slate-500'}`}>
                              {contact.subject || 'Nessun oggetto'}
                            </p>
                            <p className="text-sm text-slate-500/70 line-clamp-1">
                              {contact.message}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <StatusBadge variant={statusInfo.variant} icon={statusInfo.icon} size="sm">
                                {statusInfo.label}
                              </StatusBadge>
                              {contact.company && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100/50 px-2 py-1 rounded-lg">
                                  <Building2 className="w-3 h-3" />
                                  {contact.company}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions (non-selection mode) */}
                          {!isSelectionMode && (
                            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStarMutation.mutate({ id: contact.id });
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  contact.isStarred
                                    ? 'text-amber-400 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-amber-400 hover:bg-amber-50'
                                }`}
                              >
                                <Star className={`w-4 h-4 ${contact.isStarred ? 'fill-amber-400' : ''}`} />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-500/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Nessun messaggio</h3>
                  <p className="text-slate-500">Non ci sono messaggi da visualizzare</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Pagina <span className="font-semibold text-slate-800">{page}</span> di{' '}
                    <span className="font-semibold text-slate-800">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-2 text-sm bg-slate-100/50 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <ChevronLeft className="w-4 h-4 -ml-3" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-sm bg-slate-100/50 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Page numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg font-medium transition-all ${
                              page === pageNum
                                ? 'bg-primary text-white'
                                : 'bg-slate-100/50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-sm bg-slate-100/50 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="p-2 text-sm bg-slate-100/50 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <ChevronRight className="w-4 h-4 -ml-3" />
                    </motion.button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail - Desktop */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedContactData ? (
              <motion.div
                key={selectedContactData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="sticky top-24"
              >
                <ContactDetailPanel
                  contact={selectedContactData}
                  onClose={() => setSelectedContact(null)}
                  onReply={handleReply}
                  onArchive={handleArchive}
                  onDelete={(id) => deleteMutation.mutate({ id })}
                  onToggleStar={(id) => toggleStarMutation.mutate({ id })}
                  onSaveNotes={handleSaveNotes}
                  editingNotes={editingNotes}
                  setEditingNotes={setEditingNotes}
                  notesValue={notesValue}
                  setNotesValue={setNotesValue}
                  formatDate={formatDate}
                  isDeleting={deleteMutation.isPending}
                  isUpdating={updateMutation.isPending}
                  isTogglingStart={toggleStarMutation.isPending}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card variant="bordered">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-slate-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Seleziona un messaggio</h3>
                    <p className="text-slate-500 text-sm">Clicca su un messaggio per visualizzare i dettagli</p>
                    <p className="text-slate-400 text-xs mt-4">
                      Usa <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">↓</kbd> per navigare
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Detail Drawer */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedContactData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDetailOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl shadow-2xl"
            >
              {/* Drawer Handle */}
              <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-slate-100">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Dettaglio messaggio</h3>
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <ContactDetailPanel
                  contact={selectedContactData}
                  onClose={() => setIsMobileDetailOpen(false)}
                  onReply={handleReply}
                  onArchive={handleArchive}
                  onDelete={(id) => deleteMutation.mutate({ id })}
                  onToggleStar={(id) => toggleStarMutation.mutate({ id })}
                  onSaveNotes={handleSaveNotes}
                  editingNotes={editingNotes}
                  setEditingNotes={setEditingNotes}
                  notesValue={notesValue}
                  setNotesValue={setNotesValue}
                  formatDate={formatDate}
                  isDeleting={deleteMutation.isPending}
                  isUpdating={updateMutation.isPending}
                  isTogglingStart={toggleStarMutation.isPending}
                  isMobile
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Contact Detail Panel Component
interface ContactDetailPanelProps {
  contact: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    subject?: string | null;
    message: string;
    status: string;
    isStarred: boolean;
    adminNotes?: string | null;
    createdAt: Date | string;
  };
  onClose: () => void;
  onReply: (email: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onSaveNotes: () => void;
  editingNotes: boolean;
  setEditingNotes: (value: boolean) => void;
  notesValue: string;
  setNotesValue: (value: string) => void;
  formatDate: (date: string | Date) => string;
  isDeleting: boolean;
  isUpdating: boolean;
  isTogglingStart: boolean;
  isMobile?: boolean;
}

function ContactDetailPanel({
  contact,
  onReply,
  onArchive,
  onDelete,
  onToggleStar,
  onSaveNotes,
  editingNotes,
  setEditingNotes,
  notesValue,
  setNotesValue,
  formatDate,
  isDeleting,
  isUpdating,
  isTogglingStart,
  isMobile,
}: ContactDetailPanelProps) {
  return (
    <Card variant={isMobile ? 'default' : 'bordered'} className={isMobile ? 'border-0 shadow-none' : 'overflow-hidden'}>
      {/* Header */}
      <div className={`p-6 bg-gradient-to-br from-muted to-muted/50 ${!isMobile && 'border-b border-slate-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <span className="text-lg font-bold text-primary">
                {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{contact.name}</h3>
              {contact.company && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleStar(contact.id)}
            className={`p-2.5 rounded-xl transition-all ${
              contact.isStarred
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
            disabled={isTogglingStart}
          >
            {contact.isStarred ? (
              <Star className="w-5 h-5 fill-amber-400" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors group"
          >
            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary/10">
              <Mail className="w-3.5 h-3.5" />
            </div>
            {contact.email}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors group"
            >
              <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary/10">
                <Phone className="w-3.5 h-3.5" />
              </div>
              {contact.phone}
            </a>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500/70">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            {formatDate(contact.createdAt)}
          </div>
        </div>
      </div>

      {/* Message Content */}
      <CardContent className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-slate-800">{contact.subject || 'Nessun oggetto'}</h4>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
          {contact.message}
        </p>
      </CardContent>

      {/* Admin Notes */}
      <CardContent className="p-6 border-b border-slate-200 bg-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-slate-800">Note Admin</h4>
          </div>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs text-primary hover:underline"
            >
              {contact.adminNotes ? 'Modifica' : 'Aggiungi nota'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotesValue(contact.adminNotes || '');
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Annulla
              </button>
              <button
                onClick={onSaveNotes}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Salva
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Aggiungi note private su questo contatto..."
            className="w-full p-3 bg-white border border-amber-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 resize-none"
            rows={3}
          />
        ) : (
          <p className="text-sm text-slate-500 italic">
            {contact.adminNotes || 'Nessuna nota'}
          </p>
        )}
      </CardContent>

      {/* Actions */}
      <div className="p-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReply(contact.email)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          <Reply className="w-5 h-5" />
          Rispondi
        </motion.button>
        {contact.status !== 'ARCHIVED' && (
          <ActionButton
            icon={Archive}
            label="Archivia messaggio"
            variant="archive"
            onClick={() => onArchive(contact.id)}
          />
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div>
              <ActionButton
                icon={Trash2}
                label="Elimina messaggio"
                variant="delete"
              />
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-800">Eliminare questo messaggio?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500">
                Questa azione non può essere annullata. Il messaggio verrà eliminato permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-100/80">
                Annulla
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(contact.id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Elimina'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
