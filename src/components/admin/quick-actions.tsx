'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    icon: 'text-blue-600',
    border: 'border-blue-500/20 group-hover:border-blue-500/40',
  },
  green: {
    bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    icon: 'text-emerald-600',
    border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
  },
  purple: {
    bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    icon: 'text-purple-600',
    border: 'border-purple-500/20 group-hover:border-purple-500/40',
  },
  orange: {
    bg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    icon: 'text-orange-600',
    border: 'border-orange-500/20 group-hover:border-orange-500/40',
  },
  red: {
    bg: 'bg-red-500/10 group-hover:bg-red-500/20',
    icon: 'text-red-600',
    border: 'border-red-500/20 group-hover:border-red-500/40',
  },
  cyan: {
    bg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    icon: 'text-cyan-600',
    border: 'border-cyan-500/20 group-hover:border-cyan-500/40',
  },
};

export function QuickActions({ actions, columns = 4, className }: QuickActionsProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        const colors = colorVariants[action.color || 'blue'];

        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={action.href}
              className={cn(
                'group relative flex items-center gap-4 p-4 rounded-xl',
                'bg-slate-100/60 border backdrop-blur-sm',
                colors.border,
                'hover:bg-slate-100 transition-all duration-300',
                'overflow-hidden'
              )}
            >
              {/* Background glow effect */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                colors.bg
              )} />

              {/* Icon */}
              <div className={cn(
                'relative z-10 w-12 h-12 rounded-xl flex items-center justify-center',
                colors.bg,
                'transition-all duration-300 group-hover:scale-110'
              )}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-medium text-slate-800 transition-colors">
                  {action.label}
                </p>
                {action.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {action.description}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className={cn(
                'relative z-10 w-5 h-5 text-slate-500 transition-all duration-300',
                'group-hover:text-slate-800 group-hover:translate-x-1'
              )} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
