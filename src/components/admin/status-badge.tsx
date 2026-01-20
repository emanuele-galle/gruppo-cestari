'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cyan' | 'pink';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-500 border-slate-200',
  success: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-600 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/20',
  pink: 'bg-pink-500/15 text-pink-600 border-pink-500/20',
};

const pulseStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
  cyan: 'bg-cyan-400',
  pink: 'bg-pink-400',
};

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-xs gap-1.5',
  lg: 'px-4 py-2 text-sm gap-2',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StatusBadge({
  variant = 'default',
  children,
  icon: Icon,
  size = 'md',
  pulse = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            pulseStyles[variant]
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            pulseStyles[variant]
          )} />
        </span>
      )}
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
}

// Preset badges for common statuses
export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <StatusBadge variant={published ? 'success' : 'default'}>
      {published ? 'Pubblicato' : 'Bozza'}
    </StatusBadge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge variant={active ? 'success' : 'danger'} pulse={active}>
      {active ? 'Attivo' : 'Inattivo'}
    </StatusBadge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, BadgeVariant> = {
    SUPERADMIN: 'purple',
    ADMIN: 'info',
    EDITOR: 'cyan',
    PARTNER: 'warning',
    CLIENT: 'default',
  };

  return (
    <StatusBadge variant={variants[role] || 'default'}>
      {role}
    </StatusBadge>
  );
}
