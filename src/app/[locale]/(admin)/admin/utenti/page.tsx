'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Calendar,
  Loader2,
  UserPlus,
  Filter,
  Download,
  RefreshCw,
  Edit3,
  Crown,
  Users as UsersIcon,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  PageHeader,
  StatsCard,
  Card,
  StatusBadge,
  RoleBadge,
  ActiveBadge,
  ActionButton,
  MobileCard,
} from '@/components/admin';

const roles = ['ALL', 'SUPERADMIN', 'ADMIN', 'EDITOR', 'PARTNER', 'CLIENT'] as const;

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'PARTNER' | 'CLIENT';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedActive, setSelectedActive] = useState<string>('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('CLIENT');
  const [newUserCompany, setNewUserCompany] = useState('');

  // Change role dialog state
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('CLIENT');

  const utils = trpc.useUtils();

  // Fetch users
  const { data, isLoading, refetch } = trpc.users.list.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    role: selectedRole !== 'ALL' ? selectedRole as UserRole : undefined,
    isActive: selectedActive === 'ALL' ? undefined : selectedActive === 'ACTIVE',
  });

  // Fetch stats
  const { data: stats } = trpc.users.getStats.useQuery();

  // Mutations
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.getStats.invalidate();
      setCreateDialogOpen(false);
      resetCreateForm();
      toast.success('Utente creato con successo');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Errore durante la creazione');
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.getStats.invalidate();
      setChangeRoleDialogOpen(false);
      setSelectedUserId(null);
      toast.success('Ruolo aggiornato');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.getStats.invalidate();
      toast.success('Stato aggiornato');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.getStats.invalidate();
      toast.success('Utente eliminato');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  const users = data?.items || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('CLIENT');
    setNewUserCompany('');
  };

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error('Nome, email e password sono obbligatori');
      return;
    }
    createMutation.mutate({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      profile: newUserCompany ? { companyName: newUserCompany } : undefined,
    });
  };

  const handleChangeRole = () => {
    if (!selectedUserId) return;
    updateMutation.mutate({ id: selectedUserId, role: selectedNewRole });
  };

  const openChangeRoleDialog = (userId: string, currentRole: UserRole) => {
    setSelectedUserId(userId);
    setSelectedNewRole(currentRole);
    setChangeRoleDialogOpen(true);
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Mai';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return Crown;
      case 'ADMIN': return Shield;
      default: return User;
    }
  };

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
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Aggiorna</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t('newUser')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Nuovo Utente
                  </DialogTitle>
                  <DialogDescription>
                    Crea un nuovo account utente. L&apos;utente riceverà un&apos;email con le credenziali.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="mario@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Minimo 8 caratteri"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Ruolo</Label>
                      <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLIENT">Client</SelectItem>
                          <SelectItem value="PARTNER">Partner</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Azienda</Label>
                      <Input
                        id="company"
                        value={newUserCompany}
                        onChange={(e) => setNewUserCompany(e.target.value)}
                        placeholder="Azienda S.r.l."
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button onClick={handleCreateUser} disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Crea Utente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PageHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totale Utenti"
          value={stats?.total || 0}
          icon={UsersIcon}
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Attivi"
          value={stats?.active || 0}
          icon={CheckCircle}
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Inattivi"
          value={stats?.inactive || 0}
          icon={XCircle}
          color="red"
          delay={0.2}
        />
        <StatsCard
          title="Partner"
          value={stats?.byRole?.PARTNER || 0}
          icon={Building2}
          color="orange"
          delay={0.3}
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card variant="glass" padding="md">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-slate-100/50 border border-slate-200',
                  'text-slate-800 placeholder-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'pl-10 pr-10 py-2.5 rounded-xl appearance-none cursor-pointer min-w-[160px]',
                  'bg-slate-100/50 border border-slate-200',
                  'text-slate-800',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50'
                )}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === 'ALL' ? 'Tutti i ruoli' : role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedActive}
              onChange={(e) => {
                setSelectedActive(e.target.value);
                setPage(1);
              }}
              className={cn(
                'px-4 py-2.5 rounded-xl appearance-none cursor-pointer min-w-[140px]',
                'bg-slate-100/50 border border-slate-200',
                'text-slate-800',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50'
              )}
            >
              <option value="ALL">Tutti gli stati</option>
              <option value="ACTIVE">Solo attivi</option>
              <option value="INACTIVE">Solo inattivi</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item}>
        <Card variant="gradient" padding="none">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-slate-500 text-sm">Caricamento utenti...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-3">
                {users.map((user: (typeof users)[number]) => {
                  return (
                    <MobileCard
                      key={user.id}
                      image={user.image}
                      title={user.name || 'N/A'}
                      subtitle={user.email}
                      badges={[
                        {
                          variant: user.isActive ? 'success' : 'default',
                          label: user.isActive ? 'Attivo' : 'Inattivo',
                          icon: user.isActive ? CheckCircle : XCircle,
                        },
                      ]}
                      metadata={[
                        { icon: Shield, label: user.role },
                        ...(user.profile?.companyName ? [{ icon: Building2, label: user.profile.companyName }] : []),
                        { icon: Calendar, label: formatDate(user.createdAt) },
                      ]}
                      actions={
                        <div className="flex items-center gap-1">
                          <ActionButton
                            icon={Mail}
                            label="Invia email"
                            variant="custom"
                            onClick={() => window.location.href = `mailto:${user.email}`}
                          />
                          <div className="relative">
                            <ActionButton
                              icon={MoreVertical}
                              label="Menu azioni"
                              variant="menu"
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            />
                            {openMenuId === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-32px)] bg-white backdrop-blur-xl rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                                >
                                  <button
                                    onClick={() => openChangeRoleDialog(user.id, user.role as UserRole)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Cambia Ruolo
                                  </button>
                                  <button
                                    onClick={() => {
                                      toggleActiveMutation.mutate({ id: user.id });
                                      setOpenMenuId(null);
                                    }}
                                    className={cn(
                                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                      user.isActive
                                        ? 'text-amber-600 hover:bg-amber-500/10'
                                        : 'text-emerald-600 hover:bg-emerald-500/10'
                                    )}
                                  >
                                    {user.isActive ? (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        Disattiva
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        Riattiva
                                      </>
                                    )}
                                  </button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                        Elimina
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Eliminare questo utente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Questa azione non può essere annullata. L&apos;utente e tutti i suoi dati verranno eliminati permanentemente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            deleteMutation.mutate({ id: user.id });
                                            setOpenMenuId(null);
                                          }}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Elimina
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Utente
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Ruolo
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Stato
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                        Azienda
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">
                        Registrato
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user: (typeof users)[number], index: number) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-slate-100/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                                  {user.image ? (
                                    <img src={user.image} alt={user.name || ''} className="w-11 h-11 rounded-xl object-cover" />
                                  ) : (
                                    <User className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <div className={cn(
                                  'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card',
                                  user.isActive ? 'bg-emerald-500' : 'bg-slate-500'
                                )} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 group-hover:text-primary transition-colors">
                                  {user.name || 'N/A'}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-6 py-4">
                            <ActiveBadge active={user.isActive} />
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-sm text-slate-800/80">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              {user.profile?.companyName || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative flex items-center justify-end gap-1">
                              <ActionButton
                                icon={Mail}
                                label="Invia email"
                                variant="custom"
                                onClick={() => window.location.href = `mailto:${user.email}`}
                              />
                              <div className="relative">
                                <ActionButton
                                  icon={MoreVertical}
                                  label="Menu azioni"
                                  variant="menu"
                                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                />
                                {openMenuId === user.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-32px)] bg-white backdrop-blur-xl rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                                    >
                                      <button
                                        onClick={() => openChangeRoleDialog(user.id, user.role as UserRole)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                        Cambia Ruolo
                                      </button>
                                      <button
                                        onClick={() => {
                                          toggleActiveMutation.mutate({ id: user.id });
                                          setOpenMenuId(null);
                                        }}
                                        className={cn(
                                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                          user.isActive
                                            ? 'text-amber-400 hover:bg-amber-500/10'
                                            : 'text-emerald-400 hover:bg-emerald-500/10'
                                        )}
                                      >
                                        {user.isActive ? (
                                          <>
                                            <XCircle className="w-4 h-4" />
                                            Disattiva
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="w-4 h-4" />
                                            Riattiva
                                          </>
                                        )}
                                      </button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                            Elimina
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Eliminare questo utente?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Questa azione non può essere annullata. L&apos;utente e tutti i suoi dati verranno eliminati permanentemente.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => {
                                                deleteMutation.mutate({ id: user.id });
                                                setOpenMenuId(null);
                                              }}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Elimina
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
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

              {/* Empty State */}
              {users.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-8 h-8 text-slate-500/50" />
                  </div>
                  <p className="text-slate-500 mb-2">Nessun utente trovato</p>
                  <p className="text-slate-500/70 text-sm">Prova a modificare i filtri di ricerca</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Mostrando <span className="font-medium text-slate-800">{users.length}</span> di{' '}
                    <span className="font-medium text-slate-800">{data?.pagination?.total || 0}</span> utenti
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Precedente
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
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
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                              pageNum === page
                                ? 'bg-primary text-white'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Successivo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Cambia Ruolo
            </DialogTitle>
            <DialogDescription>
              Seleziona il nuovo ruolo per questo utente. I permessi cambieranno immediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedNewRole} onValueChange={(v) => setSelectedNewRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIENT">Client</SelectItem>
                <SelectItem value="PARTNER">Partner</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleChangeRole} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aggiorna Ruolo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
