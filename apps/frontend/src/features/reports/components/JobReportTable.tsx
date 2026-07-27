import React from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { JobReportItemDto } from '../types/reports.types';

export interface JobReportTableProps {
  items: JobReportItemDto[];
  isLoading?: boolean;
}

export const JobReportTable: React.FC<JobReportTableProps> = ({ items, isLoading }) => {
  const columns: Column<JobReportItemDto>[] = [
    {
      key: 'jobNo',
      header: 'Job No.',
      accessor: (item) => <span className="font-mono font-bold text-foreground">{item.jobNo}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      accessor: (item) => <span className="font-semibold text-foreground">{item.customerName}</span>,
    },
    {
      key: 'jobDate',
      header: 'Job Date',
      accessor: (item) => formatDate(item.jobDate),
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (item) => (
        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase">
          {item.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-foreground">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.jobId}
      isLoading={isLoading}
      emptyTitle="No job data"
      emptyDescription="No job records found for the selected period."
    />
  );
};
