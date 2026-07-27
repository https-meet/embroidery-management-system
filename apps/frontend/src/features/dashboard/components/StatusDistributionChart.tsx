import React from 'react';
import type { DashboardSummaryResponseDto, WorkQueueItemDto } from '../types/dashboard.types';

export interface StatusDistributionChartProps {
  summary: DashboardSummaryResponseDto;
  workQueue: WorkQueueItemDto[];
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  summary,
  workQueue,
}) => {
  // Compute work queue status distribution
  const statusCounts = workQueue.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const totalItems = workQueue.length || 1;

  const statuses = [
    { label: 'In Progress', key: 'IN_PROGRESS', color: 'bg-blue-500' },
    { label: 'In Production', key: 'IN_PRODUCTION', color: 'bg-indigo-500' },
    { label: 'Pending Production', key: 'PENDING_PRODUCTION', color: 'bg-amber-500' },
    { label: 'Completed', key: 'COMPLETED', color: 'bg-emerald-500' },
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Workload Distribution
        </h2>
        <p className="text-xs text-muted-foreground">
          Current status breakdown of active queue items
        </p>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted flex">
        {statuses.map((st) => {
          const count = statusCounts[st.key] || 0;
          const percentage = (count / totalItems) * 100;
          if (percentage === 0) return null;
          return (
            <div
              key={st.key}
              style={{ width: `${percentage}%` }}
              className={`${st.color} transition-all duration-500`}
              title={`${st.label}: ${count} (${Math.round(percentage)}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Details */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
        {statuses.map((st) => {
          const count = statusCounts[st.key] || 0;
          return (
            <div key={st.key} className="flex items-center space-x-2">
              <span className={`h-2.5 w-2.5 rounded-full ${st.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground truncate">{st.label}</p>
                <p className="text-xs font-semibold text-foreground">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Active Jobs: <strong className="text-foreground font-semibold">{summary.activeJobs}</strong></span>
        <span>Jobs Due Today: <strong className="text-foreground font-semibold">{summary.jobsDueToday}</strong></span>
      </div>
    </div>
  );
};
