import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, UserPlus, ShieldCheck, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import type { JobDto, JobPriority } from '@/features/jobs';

export interface ProductionQueueTableProps {
  jobs: JobDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onStartClick: (job: JobDto) => void;
  onCompleteClick: (job: JobDto) => void;
  onAssignClick: (job: JobDto) => void;
  onQualityCheckClick: (job: JobDto) => void;
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
      {priority}
    </span>
  );
};

export const ProductionQueueTable: React.FC<ProductionQueueTableProps> = ({
  jobs,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onStartClick,
  onCompleteClick,
  onAssignClick,
  onQualityCheckClick,
}) => {
  const columns: Column<JobDto>[] = [
    {
      key: 'jobNo',
      header: 'Job ID',
      sortable: true,
      accessor: (item) => (
        <Link
          to={`/production/${item.id}`}
          className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline"
        >
          {item.jobNo}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-foreground">{item.customer?.name || '—'}</span>
          {item.customer?.customerCode && (
            <p className="text-xs text-muted-foreground font-mono">{item.customer.customerCode}</p>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: (item) => <PriorityBadge priority={item.priority} />,
    },
    {
      key: 'status',
      header: 'Production Status',
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'assignedOperator',
      header: 'Operator',
      accessor: (item) =>
        item.assignedOperator ? (
          <span className="font-medium text-foreground text-xs">{item.assignedOperator}</span>
        ) : (
          <span className="text-xs italic text-amber-600 dark:text-amber-400 font-medium">Unassigned</span>
        ),
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Target Due Date',
      accessor: (item) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatDate(item.expectedDeliveryDate || item.jobDate)}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items Count',
      align: 'right',
      accessor: (item) => <span className="font-mono text-xs font-semibold tabular-nums">{item.items?.length || 0}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          {item.status === 'PENDING_PRODUCTION' && (
            <Button
              variant="outline"
              size="icon"
              title="Start Production"
              className="h-8 w-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              onClick={() => onStartClick(item)}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}

          {item.status === 'IN_PRODUCTION' && (
            <Button
              variant="outline"
              size="icon"
              title="Mark Production Completed"
              className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => onCompleteClick(item)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            title="Assign Machine Operator"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onAssignClick(item)}
          >
            <UserPlus className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Record Quality Check (QC)"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onQualityCheckClick(item)}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </Button>

          <Link to={`/production/${item.id}`}>
            <Button variant="ghost" size="icon" title="View Production Workspace" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={jobs}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      emptyTitle="No production jobs in queue"
      emptyDescription="There are currently no active production jobs in the queue matching your query."
    />
  );
};
