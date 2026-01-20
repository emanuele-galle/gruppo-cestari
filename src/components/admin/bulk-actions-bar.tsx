'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';

interface BulkAction {
  id: string;
  label: string;
  icon: typeof Trash2;
  variant: 'default' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  loading?: boolean;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  actions: BulkAction[];
  isAllSelected: boolean;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
};

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  isAllSelected,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-2xl shadow-2xl border border-slate-200">
          {/* Selection info */}
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <span className="text-lg font-bold text-primary">{selectedCount}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-800">
                {selectedCount} {selectedCount === 1 ? 'selezionato' : 'selezionati'}
              </p>
              <p className="text-slate-500 text-xs">su {totalCount} totali</p>
            </div>
          </div>

          {/* Select all / Clear */}
          <div className="flex items-center gap-2">
            {!isAllSelected && (
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Seleziona tutti
              </button>
            )}
            <button
              onClick={onClearSelection}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Annulla selezione"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${variantStyles[action.variant]}`}
                >
                  {action.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Pre-built action configurations
export const bulkActionPresets = {
  publish: (onClick: () => void, loading?: boolean): BulkAction => ({
    id: 'publish',
    label: 'Pubblica',
    icon: CheckCircle,
    variant: 'success',
    onClick,
    loading,
  }),
  unpublish: (onClick: () => void, loading?: boolean): BulkAction => ({
    id: 'unpublish',
    label: 'Rimuovi pubblicazione',
    icon: XCircle,
    variant: 'warning',
    onClick,
    loading,
  }),
  delete: (onClick: () => void, loading?: boolean): BulkAction => ({
    id: 'delete',
    label: 'Elimina',
    icon: Trash2,
    variant: 'danger',
    onClick,
    loading,
  }),
  export: (onClick: () => void, loading?: boolean): BulkAction => ({
    id: 'export',
    label: 'Esporta',
    icon: Download,
    variant: 'default',
    onClick,
    loading,
  }),
};
