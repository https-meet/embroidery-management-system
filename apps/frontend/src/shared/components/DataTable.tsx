import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching your criteria.',
  emptyAction,
  onRowClick,
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              const alignmentClass =
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'right'
                  ? 'text-right'
                  : 'text-left';

              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 ${alignmentClass} ${
                    col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''
                  }`}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div
                    className={`inline-flex items-center space-x-1 ${
                      col.align === 'right' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-muted-foreground">
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/20'
              }`}
            >
              {columns.map((col) => {
                const alignmentClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <td key={col.key} className={`px-4 py-3.5 ${alignmentClass}`}>
                    {col.accessor
                      ? col.accessor(item)
                      : (item as Record<string, unknown>)[col.key] !== undefined
                      ? String((item as Record<string, unknown>)[col.key])
                      : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
