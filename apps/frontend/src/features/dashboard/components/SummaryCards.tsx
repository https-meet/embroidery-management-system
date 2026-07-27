import React from 'react';
import { Users, Briefcase, FileText, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { DashboardSummaryResponseDto } from '../types/dashboard.types';

export interface SummaryCardsProps {
  summary: DashboardSummaryResponseDto;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const kpis = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Active Jobs',
      value: summary.activeJobs,
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      title: 'Jobs Due Today',
      value: summary.jobsDueToday,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      title: 'Pending Invoices',
      value: summary.pendingInvoices,
      icon: FileText,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(summary.outstandingBalance),
      icon: CreditCard,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(summary.totalRevenueThisMonth),
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className="flex items-center justify-between rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${kpi.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
