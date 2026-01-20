'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  title: string;
  description?: string;
  meta?: string;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  };
  action?: ReactNode;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const iconColors = {
  blue: 'bg-blue-500/20 text-blue-600',
  green: 'bg-emerald-500/20 text-emerald-600',
  purple: 'bg-purple-500/20 text-purple-600',
  orange: 'bg-orange-500/20 text-orange-600',
  red: 'bg-red-500/20 text-red-600',
  yellow: 'bg-yellow-500/20 text-yellow-600',
};

const badgeVariants = {
  default: 'bg-slate-100 text-slate-500',
  success: 'bg-emerald-500/20 text-emerald-600',
  warning: 'bg-amber-500/20 text-amber-600',
  danger: 'bg-red-500/20 text-red-600',
  info: 'bg-blue-500/20 text-blue-600',
};

export function ActivityFeed({ items, maxItems = 5, className }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className={cn('space-y-1', className)}>
      {displayItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex gap-4 p-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {/* Timeline line */}
            {index < displayItems.length - 1 && (
              <div className="absolute left-[1.625rem] top-14 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-4 ring-card',
              iconColors[item.iconColor || 'blue']
            )}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item?.title ?? 'Attività'}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      badgeVariants[item.badge.variant]
                    )}>
                      {item.badge.text}
                    </span>
                  )}
                  {item.action}
                </div>
              </div>

              {item.meta && (
                <p className="text-xs text-slate-500/70 mt-1">{item.meta}</p>
              )}
            </div>
          </motion.div>
        );
      })}

      {items.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          Nessuna attività recente
        </div>
      )}
    </div>
  );
}
