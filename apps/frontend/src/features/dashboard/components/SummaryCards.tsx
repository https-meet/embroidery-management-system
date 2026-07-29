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
      isAlert: false,
    },
    {
      title: 'Delayed Jobs Alert',
      value: summary.delayedJobs,
      subtitle: 'Past target delivery date',
      icon: AlertTriangle,
      isAlert: summary.delayedJobs > 0,
    },
    {
      title: 'Pending Collection Balance',
      value: formatCurrency(summary.outstandingBalance),
      subtitle: 'Total unpaid receivables',
      icon: CreditCard,
      isAlert: false,
    },
    {
      title: 'Revenue Collected This Month',
      value: formatCurrency(summary.totalRevenueThisMonth),
      subtitle: 'Confirmed payment inflows',
      icon: TrendingUp,
      isAlert: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Operational KPI Strip (Style Guide §8.2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className={`flex items-start justify-between rounded-lg border bg-card p-5 shadow-xs transition-colors duration-150 ${
                kpi.isAlert ? 'border-destructive/40 bg-destructive/5' : 'border-border'
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{kpi.title}</p>
                <p className={`text-3xl font-semibold tracking-tight tabular-nums ${kpi.isAlert ? 'text-destructive' : 'text-foreground'}`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground">
                <Icon className={`h-4 w-4 ${kpi.isAlert ? 'text-destructive' : 'text-muted-foreground'}`} />
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
    },
    {
      title: 'Active Jobs in Production',
      value: summary.activeJobs,
      icon: Briefcase,
    },
    {
      title: 'Pending Invoices Issued',
      value: summary.pendingInvoices,
      icon: FileText,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3">
        Secondary Business Overview
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="flex items-center justify-between border-r border-border/60 last:border-r-0 pr-4">
              <div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground mt-0.5">{kpi.value}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
