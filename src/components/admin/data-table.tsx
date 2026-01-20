'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (item: T) => void;
  selectedId?: string;
  getRowId?: (item: T) => string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  sorting?: {
    key: string;
    direction: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
  filters?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  onRowClick,
  selectedId,
  getRowId,
  pagination,
  search,
  sorting,
  filters,
  className,
}: DataTableProps<T>) {
  const [showFilters, setShowFilters] = useState(false);

  const getSortIcon = (columnKey: string) => {
    if (!sorting || sorting.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-500" />;
    }
    return sorting.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters Bar */}
      {(search || filters) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {search && (
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder={search.placeholder || 'Cerca...'}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className={cn(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-white/80 border border-slate-200/50',
                  'text-slate-800 placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                  'transition-all duration-200'
                )}
              />
            </div>
          )}

          {filters && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtri
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                showFilters && 'rotate-180'
              )} />
            </Button>
          )}
        </div>
      )}

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && filters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200/50">
              {filters}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/50 bg-white/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-slate-200/50 bg-slate-100/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                      'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
                      column.sortable && 'cursor-pointer hover:text-slate-800 transition-colors',
                      column.className
                    )}
                    onClick={() => column.sortable && sorting?.onSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-slate-500">Caricamento...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16">
                    {emptyState || (
                      <p className="text-center text-slate-500">
                        Nessun risultato trovato
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const rowId = getRowId?.(item);
                  const isSelected = selectedId && rowId === selectedId;

                  return (
                    <motion.tr
                      key={rowId || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'transition-colors',
                        onRowClick && 'cursor-pointer',
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-slate-100/50'
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn('px-6 py-4', column.className)}
                        >
                          {column.render
                            ? column.render(item, index)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            : (item as any)[column.key]?.toString() || '-'}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100/30">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-800">{data.length}</span> di{' '}
              <span className="font-medium text-slate-800">{pagination.total}</span> risultati
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Indietro</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                        pageNum === pagination.page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="gap-1"
              >
                <span className="hidden sm:inline">Avanti</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
