import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { ROUTES } from '@/shared/constants/routes';
import type { WorkQueueItemDto } from '../types/dashboard.types';

export interface WorkQueueProps {
  items: WorkQueueItemDto[];
}

export const WorkQueue: React.FC<WorkQueueProps> = ({ items }) => {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Work Queue
          </h2>
          <p className="text-xs text-muted-foreground">
            Jobs requiring attention sorted by priority and due date
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
            title="No active jobs"
            description="There are currently no active jobs in the work queue."
            icon={Briefcase}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Job Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-foreground">
                    <Link
                      to={ROUTES.JOBS.DETAIL(job.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {job.jobNo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {job.customerName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        job.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : job.priority === 'LOW'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatDate(job.dueDate, 'No due date')}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={job.status} />
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
