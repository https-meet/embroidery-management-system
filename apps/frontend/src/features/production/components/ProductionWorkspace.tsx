import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, UserPlus, ShieldCheck, Truck, Layers, User, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { JobDto } from '@/features/jobs';

export interface ProductionWorkspaceProps {
  job: JobDto;
  onStartProduction: () => void;
  onCompleteProduction: () => void;
  onAssignOperatorClick: () => void;
  onQualityCheckClick: () => void;
  onMarkReadyForDelivery: () => void;
  isPendingAction?: boolean;
}

export const ProductionWorkspace: React.FC<ProductionWorkspaceProps> = ({
  job,
  onStartProduction,
  onCompleteProduction,
  onAssignOperatorClick,
  onQualityCheckClick,
  onMarkReadyForDelivery,
  isPendingAction,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {job.jobNo}
              </h2>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customer: <strong className="font-semibold text-foreground">{job.customer?.name || '—'}</strong> ({job.customer?.customerCode})
            </p>
          </div>
        </div>

        {/* Workflow Transition Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(job.status === 'PENDING' || job.status === 'DRAFT') && (
            <Button
              size="sm"
              isLoading={isPendingAction}
              onClick={onStartProduction}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4" />
              <span>Start Machine Production</span>
            </Button>
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              isLoading={isPendingAction}
              onClick={onCompleteProduction}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete Production</span>
            </Button>
          )}

          {job.status === 'COMPLETED' && !job.deliveredAt && (
            <Button
              size="sm"
              isLoading={isPendingAction}
              onClick={onMarkReadyForDelivery}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Truck className="h-4 w-4" />
              <span>Mark Ready for Delivery</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onAssignOperatorClick}
            className="flex items-center space-x-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Assign Operator</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onQualityCheckClick}
            className="flex items-center space-x-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Record QC</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Items Specification Checklist */}
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground border-b pb-2">
            Production Specifications & Item Checklist
          </h3>

          <div className="space-y-3">
            {job.items.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-lg border bg-muted/20 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm text-foreground">{item.position}</span>
                  </div>
                  <span className="inline-flex items-center rounded bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                    {item.productionStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block">Linked Design:</span>
                    {item.design ? (
                      <Link
                        to={ROUTES.DESIGNS.DETAIL(item.design.id)}
                        className="font-medium text-primary hover:underline inline-flex items-center"
                      >
                        <span>{item.design.name} ({item.design.designCode})</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-foreground">Custom Item</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Quantity:</span>
                    <span className="font-mono font-bold text-foreground">{item.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Thread / Specs:</span>
                    <span className="text-foreground">{item.threadColor || item.dimensions || 'Standard'}</span>
                  </div>
                </div>

                {item.remarks && (
                  <p className="text-xs text-muted-foreground border-t pt-2 italic">
                    Remarks: {item.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>

          {job.notes && (
            <div className="border-t pt-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Special Production Notes:</p>
              <p className="text-xs text-foreground whitespace-pre-line">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Operator Assignment Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2 flex items-center justify-between">
              <span>Assigned Machine Operator</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={onAssignOperatorClick}
              >
                Change
              </Button>
            </h3>
            <div className="flex items-center space-x-3 text-xs">
              <User className="h-4 w-4 text-muted-foreground" />
              {job.assignedOperator ? (
                <span className="font-bold text-sm text-foreground">{job.assignedOperator}</span>
              ) : (
                <span className="italic text-amber-600 dark:text-amber-400">Unassigned</span>
              )}
            </div>
          </div>

          {/* Quality Control Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2 flex items-center justify-between">
              <span>Quality Control (QC)</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={onQualityCheckClick}
              >
                Record
              </Button>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">QC Status:</span>
                {job.qualityCheckedBy?.includes('(FAILED)') ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    FAILED (Re-work)
                  </span>
                ) : job.qualityCheckedAt ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PASSED</span>
                ) : (
                  <span className="italic text-muted-foreground">Pending Inspection</span>
                )}
              </div>
              {job.qualityCheckedBy && (
                <p className="text-[11px] text-muted-foreground">Inspector: {job.qualityCheckedBy}</p>
              )}
            </div>
          </div>

          {/* Production Timeline Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
              Production Dates
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target Due Date</span>
                <span className="font-semibold text-foreground">
                  {formatDate(job.expectedDeliveryDate)}
                </span>
              </div>
              {job.startedAt && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Started At</span>
                  </span>
                  <span className="font-medium text-foreground">{formatDate(job.startedAt)}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Completed At</span>
                  </span>
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
