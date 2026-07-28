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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      {/* Professional Page Header */}
      <WelcomeHeader />

      {/* Primary Operational KPI Strip */}
      <SummaryCards summary={data.summary} />

      {/* Rule-Based Recommended Next Steps & Business Health Summary */}
      <RecommendedNextSteps
        summary={data.summary}
        recommendedActions={data.recommendedActions || []}
      />

      {/* Quick Actions Bar */}
      <QuickActions />

      {/* Main Grid: Work Queue (65%) & Payment Follow-up (35%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WorkQueue items={data.workQueue} />
        </div>
        <div className="lg:col-span-5">
          <PaymentFollowup items={data.paymentFollowUp} />
        </div>
      </div>

      {/* Secondary Business Overview */}
      <SecondaryBusinessOverview summary={data.summary} />

      {/* Recent Business Activity & Audit Log Stream */}
      <RecentActivityTimeline activities={data.recentActivity || []} />
    </div>
  );
};
