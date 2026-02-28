'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import NotificationPopover from '@/components/portal/NotificationPopover';

const navItems = [
  { key: 'dashboard', href: '/portal', icon: LayoutDashboard },
  { key: 'documents', href: '/portal/documenti', icon: FileText },
  { key: 'applications', href: '/portal/candidature', icon: FolderOpen },
  { key: 'profile', href: '/portal/profilo', icon: User },
];

// Admin roles that should not access portal
const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR'];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const t = useTranslations('portal');
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role && adminRoles.includes(session.user.role)) {
      router.replace('/admin');
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If admin user, show loading (redirect is happening)
  if (session?.user?.role && adminRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/portal') {
      return pathname === '/portal';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/brand/logo-gruppo-cestari-color.png"
              alt="Gruppo Cestari"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[15px] font-medium">{t(`${item.key}.title`)}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-slate-800 truncate">
                {session?.user?.name || 'Utente'}
              </p>
              <p className="text-[13px] text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title - shown on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-slate-800">
                {t('dashboard.title')}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationPopover />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-32px)] bg-white rounded-lg border border-slate-200 shadow-lg z-50">
                      <div className="p-2">
                        <Link
                          href="/portal/profilo"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-[15px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Impostazioni
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[15px] text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Esci
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
