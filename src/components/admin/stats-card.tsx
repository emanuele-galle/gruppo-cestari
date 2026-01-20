'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'pink' | 'yellow';
  className?: string;
  delay?: number;
}

const colorVariants = {
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    accent: 'text-blue-600',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-600',
    accent: 'text-emerald-600',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    accent: 'text-purple-600',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600',
    accent: 'text-orange-600',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    accent: 'text-red-600',
  },
  cyan: {
    icon: 'bg-cyan-100 text-cyan-600',
    accent: 'text-cyan-600',
  },
  pink: {
    icon: 'bg-pink-100 text-pink-600',
    accent: 'text-pink-600',
  },
  yellow: {
    icon: 'bg-amber-100 text-amber-600',
    accent: 'text-amber-600',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className,
  delay = 0,
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-6 shadow-sm',
        'hover:shadow-md hover:border-slate-300 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          colors.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>

        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
            trend.value > 0
              ? 'bg-emerald-100 text-emerald-700'
              : trend.value < 0
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-600'
          )}>
            {trend.value > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">
          {typeof value === 'number' ? value.toLocaleString('it-IT') : value}
        </p>
        <p className="text-sm font-medium text-slate-600 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
