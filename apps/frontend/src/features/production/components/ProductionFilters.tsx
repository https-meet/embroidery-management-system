import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import type { JobStatus } from '@/features/jobs';

export interface ProductionFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  assignedOperator: string;
  onOperatorChange: (op: string) => void;
  status?: JobStatus;
  onStatusChange: (status: JobStatus | undefined) => void;
}

export const ProductionFilters: React.FC<ProductionFiltersProps> = ({
  search,
  onSearchChange,
  assignedOperator,
  onOperatorChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search job no, customer..."
        className="w-full sm:w-72"
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Operator Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Operator:</span>
          <input
            type="text"
            value={assignedOperator}
            onChange={(e) => onOperatorChange(e.target.value)}
            placeholder="Filter operator..."
            className="h-9 w-36 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Status:</span>
          <select
            value={status || ''}
            onChange={(e) =>
              onStatusChange((e.target.value as JobStatus) || undefined)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Production Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="QUALITY_CHECK">Quality Check</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
};
