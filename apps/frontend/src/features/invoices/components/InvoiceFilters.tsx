import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import type { InvoiceStatus } from '../types/invoice.types';

export interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  status?: InvoiceStatus;
  onStatusChange: (status: InvoiceStatus | undefined) => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search invoice no, customer, notes..."
        className="w-full sm:w-72"
      />

      <div className="flex items-center space-x-2 text-xs">
        <span className="font-medium text-muted-foreground">Status:</span>
        <select
          value={status || ''}
          onChange={(e) =>
            onStatusChange((e.target.value as InvoiceStatus) || undefined)
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ISSUED">Issued / Unpaid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>
  );
};
