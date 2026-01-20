'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  delay?: number;
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantStyles = {
  default: 'bg-white rounded-xl border border-slate-200 shadow-sm',
  glass: 'bg-white/60 backdrop-blur-md rounded-xl border border-slate-200/50 shadow-lg',
  gradient: 'bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm',
  bordered: 'bg-white rounded-xl border-2 border-slate-200 shadow-none',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', hover = false, padding = 'md', delay = 0, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ title, description, action, icon, className, children }: CardHeaderProps) {
  if (children) {
    return (
      <div className={cn('flex items-start justify-between gap-4', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            {icon}
          </div>
        )}
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && (
            <p className="text-sm text-slate-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Card Content Component
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

// Card Footer Component
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn(
      'mt-6 pt-4 border-t border-slate-200 flex items-center justify-between',
      className
    )}>
      {children}
    </div>
  );
}
