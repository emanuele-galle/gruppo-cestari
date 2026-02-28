'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartPlaceholderProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  height?: number;
  className?: string;
}

const chartIcons = {
  bar: BarChart3,
  line: TrendingUp,
  pie: PieChart,
  area: Activity,
};

export function ChartPlaceholder({
  type = 'bar',
  title = 'Grafico in arrivo',
  height = 280,
  className
}: ChartPlaceholderProps) {
  const Icon = chartIcons[type];

  // Generate random bars for visual effect
  // eslint-disable-next-line react-hooks/purity -- Math.random for placeholder data
  const bars = Array.from({ length: 12 }, () => Math.random() * 100);

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-gradient-to-br from-muted/40 to-muted/60',
        'border border-dashed border-slate-200',
        className
      )}
      style={{ height }}
    >
      {/* Animated bars background */}
      <div className="absolute inset-0 flex items-end justify-around px-4 pb-10 opacity-20">
        {bars.map((height, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height * 0.6}%` }}
            transition={{
              delay: index * 0.05,
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="w-[6%] bg-gradient-to-t from-primary/40 to-primary/10 rounded-t"
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center justify-center"
        >
          <Icon className="w-8 h-8 text-slate-500" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-xs text-slate-500/70 mt-1">
            Integrazione analytics disponibile prossimamente
          </p>
        </div>
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>
    </div>
  );
}

// Simple Chart Data Visualization
interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export function SimpleBarChart({ data, height = 200, showLabels = true, className }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={cn('flex items-end gap-2 px-2', className)} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${barHeight}%` }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'w-full rounded-t-lg min-h-[4px]',
                item.color || 'bg-gradient-to-t from-primary/80 to-primary/40'
              )}
              title={`${item.label}: ${item.value}`}
            />
            {showLabels && (
              <span className="text-[10px] text-slate-500 text-center truncate w-full">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
