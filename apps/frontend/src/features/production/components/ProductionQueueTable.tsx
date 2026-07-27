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
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    URGENT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase ${
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
      header: 'Job No.',
      sortable: true,
      accessor: (item) => (
        <Link
          to={`/production/${item.id}`}
          className="font-mono font-bold text-foreground hover:text-primary hover:underline"
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
            <p className="text-xs text-muted-foreground">{item.customer.customerCode}</p>
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
          <span className="font-medium text-foreground">{item.assignedOperator}</span>
        ) : (
          <span className="text-xs italic text-amber-600 dark:text-amber-400">Unassigned</span>
        ),
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Target Due Date',
      accessor: (item) => formatDate(item.expectedDeliveryDate || item.jobDate),
    },
    {
      key: 'items',
      header: 'Items Count',
      align: 'right',
      accessor: (item) => <span className="font-mono font-medium">{item.items?.length || 0}</span>,
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
              className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={() => onStartClick(item)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {item.status === 'IN_PRODUCTION' && (
            <Button
              variant="outline"
              size="icon"
              title="Mark Production Completed"
              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => onCompleteClick(item)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            title="Assign Machine Operator"
            className="h-8 w-8"
            onClick={() => onAssignClick(item)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Record Quality Check (QC)"
            className="h-8 w-8"
            onClick={() => onQualityCheckClick(item)}
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>

          <Link to={`/production/${item.id}`}>
            <Button variant="ghost" size="icon" title="View Production Workspace" className="h-8 w-8">
              <Eye className="h-4 w-4" />
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
