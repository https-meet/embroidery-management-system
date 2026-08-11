import React from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import type { PaymentMethod, PaymentStatus } from '../types/payment.types';

export interface PaymentFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  paymentMethod?: PaymentMethod;
  onMethodChange: (method: PaymentMethod | undefined) => void;
  status?: PaymentStatus;
  onStatusChange: (status: PaymentStatus | undefined) => void;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  search,
  onSearchChange,
  paymentMethod,
  onMethodChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search receipt no, customer, ref..."
        className="w-full sm:w-72"
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Method Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Method:</span>
          <select
            value={paymentMethod || ''}
            onChange={(e) =>
              onMethodChange((e.target.value as PaymentMethod) || undefined)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">Status:</span>
          <select
            value={status || ''}
            onChange={(e) =>
              onStatusChange((e.target.value as PaymentStatus) || undefined)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="RECORDED">Recorded</option>
            <option value="PARTIALLY_ALLOCATED">Partially Allocated</option>
            <option value="FULLY_ALLOCATED">Fully Allocated</option>
            <option value="VOID">Voided</option>
          </select>
        </div>
      </div>
    </div>
  );
};
