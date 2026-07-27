import React from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { WelcomeHeader } from '../components/WelcomeHeader';
import { SummaryCards } from '../components/SummaryCards';
import { QuickActions } from '../components/QuickActions';
import { WorkQueue } from '../components/WorkQueue';
import { PaymentFollowup } from '../components/PaymentFollowup';
import { StatusDistributionChart } from '../components/StatusDistributionChart';
import { CardSkeleton, TableSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} columns={5} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <WelcomeHeader />
        <ErrorState
          title="Failed to load dashboard data"
          message="Could not retrieve the current operational metrics from the server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Quick Actions Bar */}
      <QuickActions />

      {/* KPI Metrics Summary Cards */}
      <SummaryCards summary={data.summary} />

      {/* Workload Status Distribution Visualization */}
      <StatusDistributionChart summary={data.summary} workQueue={data.workQueue} />

      {/* Main Grid: Work Queue & Payment Follow-up */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WorkQueue items={data.workQueue} />
        <PaymentFollowup items={data.paymentFollowUp} />
      </div>
    </div>
  );
};
