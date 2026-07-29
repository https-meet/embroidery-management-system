import React from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { WelcomeHeader } from '../components/WelcomeHeader';
import { SummaryCards, SecondaryBusinessOverview } from '../components/SummaryCards';
import { RecommendedNextSteps } from '../components/RecommendedNextSteps';
import { QuickActions } from '../components/QuickActions';
import { WorkQueue } from '../components/WorkQueue';
import { PaymentFollowup } from '../components/PaymentFollowup';
import { RecentActivityTimeline } from '../components/RecentActivityTimeline';
import { CardSkeleton, TableSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted/60" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

      {/* Primary Operational KPI Strip (Style Guide §8.2: 4 cards) */}
      <SummaryCards summary={data.summary} />

      {/* Recommended Next Steps */}
      <RecommendedNextSteps
        summary={data.summary}
        recommendedActions={data.recommendedActions || []}
      />

      {/* Quick Actions Bar */}
      <QuickActions />

      {/* Twin Production & Collections Queues (Style Guide §8.2: grid lg:grid-cols-2 gap-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <WorkQueue items={data.workQueue} />
        <PaymentFollowup items={data.paymentFollowUp} />
      </div>

      {/* Secondary Business Overview */}
      <SecondaryBusinessOverview summary={data.summary} />

      {/* Recent Activity Feed (Style Guide §8.2: full-width card) */}
      <RecentActivityTimeline activities={data.recentActivity || []} />
    </div>
  );
};
