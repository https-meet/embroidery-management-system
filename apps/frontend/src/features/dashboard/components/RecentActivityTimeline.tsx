import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CreditCard, FileText, CheckCircle2, History } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import type { RecentActivityItemDto } from '../types/dashboard.types';

export interface RecentActivityTimelineProps {
  activities: RecentActivityItemDto[];
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  activities = [],
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'JOB':
        return <Briefcase className="h-4 w-4 text-muted-foreground" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'INVOICE':
        return <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'QUALITY_CHECK':
        return <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Recent Operational Activity
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Real-time Audit Stream</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-3">
          No recent activity recorded yet.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {activities.slice(0, 8).map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3 text-xs">
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{act.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{act.description}</p>
                </div>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  {formatDate(act.timestamp)}
                </span>
                {act.linkUrl && (
                  <div>
                    <Link
                      to={act.linkUrl}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
