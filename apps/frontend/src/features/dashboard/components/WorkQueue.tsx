import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Play, Eye } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { WorkQueueItemDto } from '../types/dashboard.types';

export interface WorkQueueProps {
  items: WorkQueueItemDto[];
}

export const WorkQueue: React.FC<WorkQueueProps> = ({ items }) => {
  return (
    <div className="rounded-lg border border-border/70 bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Today's Production Queue
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Active embroidery jobs sorted by priority and delivery deadline
          </p>
        </div>
        <Link
          to={ROUTES.JOBS.LIST}
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          <span>View all jobs</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No active production jobs"
            description="All scheduled embroidery orders have been processed or moved to quality inspection."
            icon={Briefcase}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Job Number</th>
                <th className="px-3.5 py-2.5">Customer</th>
                <th className="px-3.5 py-2.5">Priority</th>
                <th className="px-3.5 py-2.5">Due Date</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono font-medium text-foreground">
                    <Link
                      to={ROUTES.JOBS.DETAIL(job.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {job.jobNo}
                    </Link>
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                    {job.customerName}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        job.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                          : job.priority === 'LOW'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                      }`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-muted-foreground">
                    {formatDate(job.dueDate, 'No due date')}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link to={`/production`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          title="Open Production Queue"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={ROUTES.JOBS.DETAIL(job.id)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-muted"
                          title="View Job Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

