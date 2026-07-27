import React from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate } from '@/shared/utils/formatDate';
import type { ProductionReportItemDto } from '../types/reports.types';

export interface ProductionReportTableProps {
  items: ProductionReportItemDto[];
  isLoading?: boolean;
}

export const ProductionReportTable: React.FC<ProductionReportTableProps> = ({ items, isLoading }) => {
  const columns: Column<ProductionReportItemDto>[] = [
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
      key: 'assignedOperator',
      header: 'Assigned Operator',
      accessor: (item) =>
        item.assignedOperator ? (
          <span className="font-medium text-foreground">{item.assignedOperator}</span>
        ) : (
          <span className="text-xs italic text-amber-600 dark:text-amber-400">Unassigned</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'startedAt',
      header: 'Started At',
      accessor: (item) => (item.startedAt ? formatDate(item.startedAt) : '—'),
    },
    {
      key: 'completedAt',
      header: 'Completed At',
      accessor: (item) => (item.completedAt ? formatDate(item.completedAt) : '—'),
    },
    {
      key: 'itemCount',
      header: 'Items Count',
      align: 'right',
      accessor: (item) => <span className="font-mono font-medium">{item.itemCount}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.jobId}
      isLoading={isLoading}
      emptyTitle="No production data"
      emptyDescription="No machine production records found for the selected period."
    />
  );
};
