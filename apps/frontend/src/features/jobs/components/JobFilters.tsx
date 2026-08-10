import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import type { JobPriority, JobStatus } from '../types/job.types';

export interface JobFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  status?: JobStatus;
  onStatusChange: (status: JobStatus | undefined) => void;
  priority?: JobPriority;
  onPriorityChange: (priority: JobPriority | undefined) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search job no, customer, notes..."
        className="w-full sm:w-72"
      />

      <div className="flex flex-wrap items-center gap-3">
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
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="QUALITY_CHECK">Quality Check</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Priority:</span>
          <select
            value={priority || ''}
            onChange={(e) =>
              onPriorityChange((e.target.value as JobPriority) || undefined)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
    </div>
  );
};
