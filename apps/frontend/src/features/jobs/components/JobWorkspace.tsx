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
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    URGENT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold uppercase ${
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
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-mono tracking-tight text-foreground">
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
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4" />
              <span>Start Production</span>
            </Button>
          )}

          {(job.status === 'IN_PROGRESS' || (job.status as string) === 'IN_PRODUCTION' || (job.status as string) === 'PENDING_PRODUCTION') && (
            <Button
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={() => onStatusChange('COMPLETED')}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Completed</span>
            </Button>
          )}

          {job.status === 'COMPLETED' && (
            <Button
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={() => onStatusChange('DELIVERED')}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Delivered</span>
            </Button>
          )}

          {/* Quick Status Selector */}
          <div className="flex items-center space-x-1.5 border rounded-md px-2 py-1.5 bg-muted/30 text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <select
              value={job.status}
              disabled={isUpdatingStatus}
              onChange={(e) => onStatusChange(e.target.value as JobStatus)}
              className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <Link to={`${ROUTES.JOBS.DETAIL(job.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <Edit2 className="h-4 w-4" />
              <span>Edit Job</span>
            </Button>
          </Link>

          {job.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveClick}
              className="flex items-center space-x-1.5 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Archive className="h-4 w-4" />
              <span>Cancel Job</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Items Table */}
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground border-b pb-2">
            Job Line Items & Specifications
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Design</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {job.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="py-3 px-3 font-semibold text-foreground">{item.position}</td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-sm text-foreground border-t pt-2">
                <span>Total Amount:</span>
                <span className="font-mono">{formatCurrency(job.totalAmount)}</span>
              </div>
            </div>
          </div>

          {job.notes && (
            <div className="border-t pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Special Instructions / Notes:</p>
              <p className="text-xs text-foreground whitespace-pre-line">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-4">
          {/* Customer Overview */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
              Customer Information
            </h3>
            {job.customer ? (
              <div className="space-y-2 text-xs">
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
                  <p className="text-muted-foreground">Mobile: {job.customer.mobile}</p>
                )}
                {job.customer.email && (
                  <p className="text-muted-foreground">Email: {job.customer.email}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No customer linked</p>
            )}
          </div>

          {/* Timeline & Key Dates */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
              Order Lifecycle Timeline
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-medium text-foreground">{formatDate(job.jobDate)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Target Due Date</span>
                <span className="font-semibold text-foreground">
                  {formatDate(job.expectedDeliveryDate || job.jobDate)}
                </span>
              </div>
              {job.startedAt && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground">Production Started</span>
                  <span className="font-medium text-foreground">{formatDate(job.startedAt)}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground">Completed At</span>
                  <span className="font-medium text-foreground">{formatDate(job.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
