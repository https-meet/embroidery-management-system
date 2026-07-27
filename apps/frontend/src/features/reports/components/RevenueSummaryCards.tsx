import React from 'react';
import { DollarSign, FileText, Percent, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { RevenueReportDto } from '../types/reports.types';

export interface RevenueSummaryCardsProps {
  data?: RevenueReportDto;
}

export const RevenueSummaryCards: React.FC<RevenueSummaryCardsProps> = ({ data }) => {
  const totalInvoiced = data?.totalInvoiced || 0;
  const totalCollected = data?.totalCollected || 0;
  const totalOutstanding = data?.totalOutstanding || 0;

  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Billed / Invoiced */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Total Invoiced Amount</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">
          {formatCurrency(totalInvoiced)}
        </p>
        <p className="text-[11px] text-muted-foreground">Cumulative billed across specified period</p>
      </div>

      {/* Total Revenue Collected */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Total Revenue Collected</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalCollected)}
        </p>
        <p className="text-[11px] text-muted-foreground">Realized cash / payment receipts</p>
      </div>

      {/* Outstanding Receivables */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Outstanding Receivables</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
          {formatCurrency(totalOutstanding)}
        </p>
        <p className="text-[11px] text-muted-foreground">Uncollected invoice balance</p>
      </div>

      {/* Collection Efficiency Rate */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Collection Efficiency</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">{collectionRate}%</p>
        <p className="text-[11px] text-muted-foreground">Ratio of collected vs total invoiced</p>
      </div>
    </div>
  );
};
