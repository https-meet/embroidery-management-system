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
      header: 'Job No.',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.JOBS.DETAIL(item.id)}
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
          <span className="font-semibold text-foreground">
            {item.customer?.name || '—'}
          </span>
          {item.customer?.customerCode && (
            <p className="text-xs text-muted-foreground">{item.customer.customerCode}</p>
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
      header: 'Due Date',
      accessor: (item) => formatDate(item.expectedDeliveryDate || item.jobDate),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-semibold text-foreground">
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
            <Button variant="ghost" size="icon" title="View Job Workspace" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`${ROUTES.JOBS.DETAIL(item.id)}/edit`}>
            <Button variant="ghost" size="icon" title="Edit Job Details" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          {item.status !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="icon"
              title="Archive/Cancel Job"
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
