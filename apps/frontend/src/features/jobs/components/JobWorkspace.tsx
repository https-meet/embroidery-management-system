import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, Edit2, Archive, CheckCircle2, Play } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { JobDto, JobPriority, JobStatus } from '../types/job.types';

export interface JobWorkspaceProps {
  job: JobDto;
  onStatusChange: (newStatus: JobStatus) => void;
  onArchiveClick: () => void;
  isUpdatingStatus?: boolean;
}

const PriorityBadge: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const colorMap: Record<JobPriority, string> = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20',
    NORMAL: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase select-none ${
        colorMap[priority] || colorMap.NORMAL
      }`}
    >
      {priority} Priority
    </span>
  );
};

export const JobWorkspace: React.FC<JobWorkspaceProps> = ({
  job,
  onStatusChange,
  onArchiveClick,
  isUpdatingStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:space-y-0 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold font-mono tracking-tight text-foreground">
                {job.jobNo}
              </h2>
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customer: <strong className="font-semibold text-foreground">{job.customer?.name || '—'}</strong> ({job.customer?.customerCode})
            </p>
          </div>
        </div>

        {/* Action Controls & Lifecycle State Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {job.status === 'DRAFT' && (
            <Button
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={() => onStatusChange('IN_PROGRESS')}
              className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Start Production</span>
            </Button>
          )}

          {(job.status === 'IN_PROGRESS' || (job.status as string) === 'IN_PRODUCTION' || (job.status as string) === 'PENDING_PRODUCTION') && (
            <Button
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={() => onStatusChange('COMPLETED')}
              className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Completed</span>
            </Button>
          )}

          {job.status === 'COMPLETED' && (
            <Button
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={() => onStatusChange('DELIVERED')}
              className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Delivered</span>
            </Button>
          )}

          {/* Quick Status Selector */}
          <div className="flex items-center space-x-1.5 border border-input rounded-md px-2 py-1 bg-background text-xs">
            <span className="text-muted-foreground font-medium text-[11px]">Status:</span>
            <select
              value={job.status}
              disabled={isUpdatingStatus}
              onChange={(e) => onStatusChange(e.target.value as JobStatus)}
              className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer text-xs"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <Link to={`${ROUTES.JOBS.DETAIL(job.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5 h-8 text-xs">
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Job</span>
            </Button>
          </Link>

          {job.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveClick}
              className="flex items-center space-x-1.5 h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Cancel Job</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Items Table */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs lg:col-span-2">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3">
            Job Line Items & Specifications
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Position</th>
                  <th className="px-4 py-2.5">Design</th>
                  <th className="px-4 py-2.5 text-right">Qty</th>
                  <th className="px-4 py-2.5 text-right">Rate</th>
                  <th className="px-4 py-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {job.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors duration-150">
                    <td className="px-4 py-3 font-semibold text-foreground text-xs">{item.position}</td>
                    <td className="px-4 py-3 text-xs">
                      {item.design ? (
                        <Link
                          to={ROUTES.DESIGNS.DETAIL(item.design.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.design.name} ({item.design.designCode})
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Custom / No design link</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-foreground tabular-nums">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                <span>Total Amount:</span>
                <span className="font-mono tabular-nums">{formatCurrency(job.totalAmount)}</span>
              </div>
            </div>
          </div>

          {job.notes && (
            <div className="border-t border-border pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Special Instructions / Notes:</p>
              <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          {/* Customer Overview */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3">
              Customer Information
            </h3>
            {job.customer ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={ROUTES.CUSTOMERS.DETAIL(job.customer.id)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {job.customer.name}
                  </Link>
                </div>
                {job.customer.mobile && (
                  <p className="text-muted-foreground font-mono tabular-nums">Mobile: {job.customer.mobile}</p>
                )}
                {job.customer.email && (
                  <p className="text-muted-foreground">Email: {job.customer.email}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No customer linked</p>
            )}
          </div>

          {/* Timeline & Key Dates */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3">
              Order Lifecycle Timeline
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-mono tabular-nums font-medium text-foreground">{formatDate(job.jobDate)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Target Due Date</span>
                <span className="font-mono tabular-nums font-semibold text-foreground">
                  {formatDate(job.expectedDeliveryDate || job.jobDate)}
                </span>
              </div>
              {job.startedAt && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Production Started</span>
                  <span className="font-mono tabular-nums font-medium text-foreground">{formatDate(job.startedAt)}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Completed At</span>
                  <span className="font-mono tabular-nums font-medium text-foreground">{formatDate(job.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
