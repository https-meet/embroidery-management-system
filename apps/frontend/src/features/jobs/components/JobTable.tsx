import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Archive, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { ROUTES } from '@/shared/constants/routes';
import type { JobDto, JobPriority } from '../types/job.types';

export interface JobTableProps {
  jobs: JobDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onArchiveClick: (job: JobDto) => void;
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase select-none ${
        colorMap[priority] || colorMap.NORMAL
      }`}
    >
      {priority}
    </span>
  );
};

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onArchiveClick,
}) => {
  const columns: Column<JobDto>[] = [
    {
      key: 'jobNo',
      header: 'Job ID',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.JOBS.DETAIL(item.id)}
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
          <span className="font-semibold text-foreground">
            {item.customer?.name || '—'}
          </span>
          {item.customer?.customerCode && (
            <p className="text-xs text-muted-foreground font-mono">{item.customer.customerCode}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: (item) => <PriorityBadge priority={item.priority} />,
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Target Due Date',
      accessor: (item) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatDate(item.expectedDeliveryDate)}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link to={ROUTES.JOBS.DETAIL(item.id)}>
            <Button variant="ghost" size="icon" title="View Job Workspace" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`${ROUTES.JOBS.DETAIL(item.id)}/edit`}>
            <Button variant="ghost" size="icon" title="Edit Job Details" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          {item.status !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="icon"
              title="Archive Job"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onArchiveClick(item)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
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
      emptyTitle="No jobs found"
      emptyDescription="There are no embroidery jobs matching your query. Create a new job order to get started."
    />
  );
};
