'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { redirect } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Users,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Globe,
  FolderOpen,
  FolderKanban,
  Search,
  Command,
  ChevronRight,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
  { key: 'news', href: '/admin/news', icon: Newspaper, color: 'from-emerald-500 to-teal-500' },
  { key: 'bandi', href: '/admin/bandi', icon: FileText, color: 'from-purple-500 to-pink-500' },
  { key: 'progetti', href: '/admin/progetti', icon: FolderKanban, color: 'from-cyan-500 to-blue-500' },
  { key: 'candidature', href: '/admin/candidature', icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
  { key: 'users', href: '/admin/utenti', icon: Users, color: 'from-orange-500 to-amber-500' },
  { key: 'contacts', href: '/admin/contatti', icon: Mail, color: 'from-red-500 to-rose-500' },
  { key: 'settings', href: '/admin/impostazioni', icon: Settings, color: 'from-slate-500 to-zinc-500' },
];

const quickLinks = [
  { label: 'Vedi sito', href: '/', icon: Globe, external: true },
  { label: 'Portale', href: '/portal', icon: FolderOpen },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const t = useTranslations('admin');
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-primary/30 animate-ping" />
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const userRole = session.user?.role;
  if (!userRole || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    redirect('/portal');
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const current = navItems.find(item => isActive(item.href));
    return current ? t(`nav.${current.key}`) : 'Admin';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-5 pointer-events-none" />

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-72',
          'bg-white/95 backdrop-blur-xl border-r border-slate-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <Link href="/admin" className="flex items-center gap-3">
            {sidebarCollapsed ? (
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="font-bold text-white text-sm">GC</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <Image
                  src="/images/brand/logo-gruppo-cestari-color.png"
                  alt="Gruppo Cestari"
                  width={130}
                  height={36}
                  className="h-8 w-auto"
                  priority
                />
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            // Hide settings for editors
            if (item.key === 'settings' && userRole === 'EDITOR') return null;
            // Hide users for editors
            if (item.key === 'users' && userRole === 'EDITOR') return null;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'group',
                  active
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}

                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                  active
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : 'bg-slate-100 group-hover:bg-slate-200'
                )}>
                  <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                </div>

                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{t(`nav.${item.key}`)}</span>
                )}

                {!sidebarCollapsed && active && (
                  <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100/50 to-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Link Rapidi
              </p>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 py-1.5 transition-colors"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-slate-200">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-slate-100/50',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {userRole}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Collapse button (desktop) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Link href="/admin" className="hover:text-primary">Admin</Link>
                  {pathname !== '/admin' && (
                    <>
                      <span>/</span>
                      <span className="text-slate-600">{getPageTitle()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-500 bg-slate-100/50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">Cerca...</span>
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-slate-500">
                  <Command className="w-3 h-3" />
                  K
                </kbd>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Help */}
              <div className="relative">
                <button
                  onClick={() => setHelpOpen(!helpOpen)}
                  className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {helpOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setHelpOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-800">Centro Assistenza</h3>
                          <p className="text-xs text-slate-500 mt-1">Come possiamo aiutarti?</p>
                        </div>
                        <div className="p-2">
                          <a
                            href="mailto:supporto@gruppocestari.com"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Contatta il supporto
                          </a>
                          <Link
                            href="/admin/impostazioni"
                            onClick={() => setHelpOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Impostazioni account
                          </Link>
                          <a
                            href="https://gruppocestari.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            Visita il sito
                          </a>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                          <p className="text-[10px] text-slate-400 text-center">
                            Versione 1.0.0 • Gruppo Cestari
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationsOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800">Notifiche</h3>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Nuove
                          </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          <Link
                            href="/admin/contatti"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">Nuovi messaggi</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Controlla i nuovi messaggi dal form contatti
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="/admin/candidature"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
                          >
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                              <ClipboardList className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">Candidature</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Visualizza le candidature ai bandi
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="/admin/news"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                              <Newspaper className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">Gestisci News</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Pubblica o modifica articoli
                              </p>
                            </div>
                          </Link>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                          <Link
                            href="/admin"
                            onClick={() => setNotificationsOpen(false)}
                            className="text-xs text-primary hover:underline block text-center"
                          >
                            Vai alla Dashboard
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <Users className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-slate-500 transition-transform hidden sm:block',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-200">
                          <p className="text-sm font-medium text-slate-800">{session?.user?.name}</p>
                          <p className="text-xs text-slate-500">{session?.user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/admin/impostazioni"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Impostazioni
                          </Link>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Esci
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Search Modal Placeholder */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cerca pagine, utenti, contenuti..."
                  className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-slate-100 rounded text-slate-500">ESC</kbd>
              </div>
              <div className="p-4 text-center text-slate-500 text-sm">
                Inizia a digitare per cercare...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
