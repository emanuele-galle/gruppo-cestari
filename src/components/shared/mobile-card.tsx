'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Square, CheckSquare } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/status-badge';

interface BadgeConfig {
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cyan' | 'pink';
  label: string;
  icon?: LucideIcon;
  pulse?: boolean;
}

interface MetadataItem {
  icon: LucideIcon;
  label: string | number;
  className?: string;
}

interface MobileCardProps {
  // Content
  image?: string | null;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  badges?: BadgeConfig[];
  metadata?: MetadataItem[];

  // Selection
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;

  // Actions
  actions?: ReactNode;

  // Styling
  className?: string;
  onClick?: () => void;

  // Animation
  index?: number;
}

export function MobileCard({
  image,
  imageAlt = '',
  title,
  subtitle,
  badges = [],
  metadata = [],
  selectable = false,
  selected = false,
  onSelect,
  actions,
  className,
  onClick,
  index = 0,
}: MobileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-4 transition-all',
        selected && 'border-primary/50 bg-primary/5',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-sm',
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Selection checkbox */}
        {selectable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className={cn(
              'shrink-0 p-1 rounded-lg transition-colors',
              selected ? 'text-primary' : 'text-slate-400 hover:text-primary'
            )}
            aria-label={selected ? 'Deseleziona' : 'Seleziona'}
          >
            {selected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Image */}
        {image !== undefined && (
          <div className="shrink-0 w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
            {image ? (
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized={image.startsWith('http://localhost')}
              />
            ) : (
              <div className="w-6 h-6 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row with badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-800 line-clamp-2">
                {title}
              </h4>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions on right */}
            {actions && (
              <div className="shrink-0 flex items-center gap-1">
                {actions}
              </div>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {badges.map((badge, idx) => (
                <StatusBadge
                  key={idx}
                  variant={badge.variant}
                  icon={badge.icon}
                  pulse={badge.pulse}
                  size="sm"
                >
                  {badge.label}
                </StatusBadge>
              ))}
            </div>
          )}

          {/* Metadata row */}
          {metadata.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              {metadata.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-1.5 text-xs text-slate-500',
                      item.className
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton loader for MobileCard
export function MobileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="shrink-0 w-14 h-14 rounded-lg bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 bg-slate-200 rounded-full w-16" />
            <div className="h-5 bg-slate-200 rounded-full w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
