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
    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            In Production Queue
          </h2>
          <p className="text-xs text-muted-foreground">
            Active embroidery jobs sorted by delivery priority
          </p>
        </div>
        <Link
          to={ROUTES.JOBS.LIST}
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-6 my-auto">
          <EmptyState
            title="No active production jobs"
            description="All scheduled embroidery orders have been processed or moved to quality inspection."
            icon={Briefcase}
          />
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Job ID</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-muted/40 transition-colors duration-150">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    <Link
                      to={ROUTES.JOBS.DETAIL(job.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {job.jobNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground text-xs">
                    {job.customerName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                    {formatDate(job.dueDate, 'No due date')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link to={`/production`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          title="Open Production Queue"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={ROUTES.JOBS.DETAIL(job.id)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted"
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
