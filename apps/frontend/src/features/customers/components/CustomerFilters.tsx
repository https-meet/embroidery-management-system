import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import type { CustomerType } from '../types/customer.types';

export interface CustomerFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  customerType?: CustomerType;
  onTypeChange: (type: CustomerType | undefined) => void;
  isActive?: boolean;
  onStatusChange: (isActive: boolean | undefined) => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  search,
  onSearchChange,
  customerType,
  onTypeChange,
  isActive = true,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search code, name, mobile..."
        className="w-full sm:w-72"
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Customer Type Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Type:</span>
          <select
            value={customerType || ''}
            onChange={(e) =>
              onTypeChange((e.target.value as CustomerType) || undefined)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Status:</span>
          <select
            value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') onStatusChange(undefined);
              else if (val === 'active') onStatusChange(true);
              else onStatusChange(false);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>
    </div>
  );
};
