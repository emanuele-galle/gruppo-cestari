'use client';

import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Edit, Eye, Trash2, MoreVertical } from 'lucide-react';

type ActionVariant = 'edit' | 'view' | 'delete' | 'archive' | 'menu' | 'publish' | 'custom';

interface ActionButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon;
  label: string; // Required for accessibility (aria-label)
  variant?: ActionVariant;
  href?: string;
  target?: '_blank' | '_self';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const variantStyles: Record<ActionVariant, { base: string; hover: string }> = {
  edit: {
    base: 'text-slate-600',
    hover: 'hover:text-primary hover:bg-primary/10',
  },
  view: {
    base: 'text-slate-600',
    hover: 'hover:text-blue-600 hover:bg-blue-500/10',
  },
  delete: {
    base: 'text-slate-600',
    hover: 'hover:text-red-600 hover:bg-red-500/10',
  },
  archive: {
    base: 'text-slate-600',
    hover: 'hover:text-amber-600 hover:bg-amber-500/10',
  },
  menu: {
    base: 'text-slate-600',
    hover: 'hover:text-slate-800 hover:bg-slate-100',
  },
  publish: {
    base: 'text-slate-600',
    hover: 'hover:text-emerald-600 hover:bg-emerald-500/10',
  },
  custom: {
    base: 'text-slate-600',
    hover: 'hover:text-slate-800 hover:bg-slate-100',
  },
};

const sizeStyles = {
  sm: {
    padding: 'p-2',
    icon: 'w-4 h-4',
  },
  md: {
    padding: 'p-2.5',
    icon: 'w-5 h-5',
  },
  lg: {
    padding: 'p-3',
    icon: 'w-6 h-6',
  },
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      icon: Icon,
      label,
      variant = 'custom',
      href,
      target,
      size = 'md',
      disabled = false,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    const buttonClasses = cn(
      // Base styles
      'inline-flex items-center justify-center rounded-lg transition-all duration-200',
      // Focus visible for accessibility
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
      // Size
      sizes.padding,
      // Variant colors
      styles.base,
      !disabled && styles.hover,
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    const iconElement = <Icon className={sizes.icon} />;

    // If href is provided, render as Link
    if (href && !disabled) {
      return (
        <Link
          href={href}
          target={target}
          aria-label={label}
          className={buttonClasses}
        >
          <motion.span
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex"
          >
            {iconElement}
          </motion.span>
        </Link>
      );
    }

    // Otherwise render as button
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.1 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        className={buttonClasses}
        {...props}
      >
        {iconElement}
      </motion.button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

// Preset action buttons for common use cases
interface PresetActionProps {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function EditAction({ href, onClick, ...props }: PresetActionProps) {
  const EditIcon = Edit;
  return (
    <ActionButton
      icon={EditIcon}
      label="Modifica"
      variant="edit"
      href={href}
      onClick={onClick}
      {...props}
    />
  );
}

function ViewAction({ href, onClick, target = '_blank', ...props }: PresetActionProps & { target?: '_blank' | '_self' }) {
  const EyeIcon = Eye;
  return (
    <ActionButton
      icon={EyeIcon}
      label="Visualizza"
      variant="view"
      href={href}
      target={target}
      onClick={onClick}
      {...props}
    />
  );
}

function DeleteAction({ onClick, ...props }: Omit<PresetActionProps, 'href'>) {
  const Trash2Icon = Trash2;
  return (
    <ActionButton
      icon={Trash2Icon}
      label="Elimina"
      variant="delete"
      onClick={onClick}
      {...props}
    />
  );
}

function MenuAction({ onClick, ...props }: Omit<PresetActionProps, 'href'>) {
  const MoreVerticalIcon = MoreVertical;
  return (
    <ActionButton
      icon={MoreVerticalIcon}
      label="Menu azioni"
      variant="menu"
      onClick={onClick}
      {...props}
    />
  );
}
