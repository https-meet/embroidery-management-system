import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';

export interface DesignFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  category?: string;
  onCategoryChange: (category: string | undefined) => void;
  isActive?: boolean;
  onStatusChange: (isActive: boolean | undefined) => void;
}

export const DesignFilters: React.FC<DesignFiltersProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  isActive = true,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search code, design name, category..."
        className="w-full sm:w-72"
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Category:</span>
          <input
            type="text"
            value={category || ''}
            onChange={(e) => onCategoryChange(e.target.value.trim() || undefined)}
            placeholder="Filter category..."
            className="h-9 w-36 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Status:</span>
          <select
            value={isActive === undefined ? 'all' : isActive ? 'active' : 'archived'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') onStatusChange(undefined);
              else if (val === 'active') onStatusChange(true);
              else onStatusChange(false);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>
    </div>
  );
};
