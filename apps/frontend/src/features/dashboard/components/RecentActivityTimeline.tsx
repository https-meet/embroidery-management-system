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
        return <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'INVOICE':
        return <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'QUALITY_CHECK':
        return <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Recent Business Activity & Transaction Stream
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">Real-time audit log</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-3">
          No recent activity recorded yet.
        </p>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {activities.map((act) => (
            <div key={act.id} className="relative flex items-start justify-between text-xs">
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border shadow-xs">
                {getIcon(act.type)}
              </div>
              <div className="min-w-0 pr-4">
                <p className="font-semibold text-foreground">{act.title}</p>
                <p className="text-muted-foreground">{act.description}</p>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formatDate(act.timestamp)}
                </span>
                {act.linkUrl && (
                  <div>
                    <Link
                      to={act.linkUrl}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      View Record →
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
