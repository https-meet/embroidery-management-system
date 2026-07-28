import React from 'react';
import { Users, Briefcase, FileText, CreditCard, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { DashboardSummaryResponseDto } from '../types/dashboard.types';

export interface SummaryCardsProps {
  summary: DashboardSummaryResponseDto;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const primaryKpis = [
    {
      title: 'Jobs Due Today',
      value: summary.jobsDueToday,
      subtitle: 'Target delivery today',
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      title: 'Delayed Jobs Alert',
      value: summary.delayedJobs,
      subtitle: 'Past target delivery date',
      icon: AlertTriangle,
      color: summary.delayedJobs > 0
        ? 'text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-300 font-bold'
        : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      title: 'Pending Collection Balance',
      value: formatCurrency(summary.outstandingBalance),
      subtitle: 'Total unpaid receivables',
      icon: CreditCard,
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      title: 'Revenue Collected This Month',
      value: formatCurrency(summary.totalRevenueThisMonth),
      subtitle: 'Confirmed payment inflows',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Operational Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="flex items-center justify-between rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SecondaryBusinessOverview: React.FC<{ summary: DashboardSummaryResponseDto }> = ({ summary }) => {
  const secondaryKpis = [
    {
      title: 'Total Active Customers',
      value: summary.totalCustomers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Active Jobs in Production',
      value: summary.activeJobs,
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      title: 'Pending Invoices Issued',
      value: summary.pendingInvoices,
      icon: FileText,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
        Secondary Business Overview
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="flex items-center justify-between border-r last:border-r-0 pr-4">
              <div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                <p className="text-xl font-bold font-mono text-foreground mt-0.5">{kpi.value}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
