import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { RupeeIcon } from '@/shared/components/icons/RupeeIcon';
import { Button } from '@/shared/components/ui/button';
import type { DashboardSummaryResponseDto, RecommendedActionDto } from '../types/dashboard.types';

export interface RecommendedNextStepsProps {
  summary: DashboardSummaryResponseDto;
  recommendedActions: RecommendedActionDto[];
}

export const RecommendedNextSteps: React.FC<RecommendedNextStepsProps> = ({
  summary,
  recommendedActions,
}) => {
  // Determine Business Health Status (Deterministic, 100% data-driven)
  let healthLabel = 'Operational On-Track';
  let healthColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  let healthDescription = 'All production orders and collections are running on schedule.';

  if (summary.delayedJobs > 0) {
    healthLabel = 'Attention Required';
    healthColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
    healthDescription = `${summary.delayedJobs} order(s) are past their target delivery date.`;
  } else if (summary.jobsAwaitingQc > 0 || summary.outstandingBalance > 50000) {
    healthLabel = 'Pending Action Items';
    healthColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    healthDescription = 'Completed orders awaiting quality inspection or pending payments.';
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'DELAYED_JOB':
        return <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'AWAITING_QC':
        return <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'OVERDUE_PAYMENT':
        return <RupeeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Business Health Summary (1/3 Width) */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Business Health Status
          </h3>
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>

        <div className="space-y-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${healthColor}`}>
            {healthLabel}
          </span>
          <p className="text-xs text-muted-foreground">{healthDescription}</p>
        </div>

        <div className="border-t pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">QC Pending:</span>
            <span className="font-bold text-foreground">{summary.jobsAwaitingQc} Jobs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending Collections:</span>
            <span className="font-bold font-mono text-foreground">₹{summary.outstandingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Rule-Based Recommended Next Steps (2/3 Width) */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Recommended Action Items
          </h3>
          <span className="text-xs text-muted-foreground font-medium">Data-Driven Priority</span>
        </div>

        {recommendedActions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No urgent action items required today. All production and collections are operating smoothly.
          </p>
        ) : (
          <div className="space-y-2.5">
            {recommendedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between rounded-md border bg-muted/20 p-3 text-xs"
              >
                <div className="flex items-start space-x-3 min-w-0 pr-2">
                  <div className="mt-0.5 shrink-0">{getActionIcon(action.type)}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{action.title}</p>
                    <p className="text-muted-foreground truncate">{action.description}</p>
                  </div>
                </div>
                <Link to={action.actionUrl} className="shrink-0">
                  <Button variant="outline" size="sm" className="h-8 text-xs flex items-center space-x-1">
                    <span>{action.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
