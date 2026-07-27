import React from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { CustomerReportItemDto } from '../types/reports.types';

export interface CustomerReportTableProps {
  items: CustomerReportItemDto[];
  isLoading?: boolean;
}

export const CustomerReportTable: React.FC<CustomerReportTableProps> = ({ items, isLoading }) => {
  const columns: Column<CustomerReportItemDto>[] = [
    {
      key: 'customerCode',
      header: 'Customer Code',
      accessor: (item) => <span className="font-mono font-bold text-foreground">{item.customerCode}</span>,
    },
    {
      key: 'name',
      header: 'Customer Name',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-foreground">{item.name}</span>
          <p className="text-[11px] text-muted-foreground uppercase">{item.customerType}</p>
        </div>
      ),
    },
    {
      key: 'totalJobs',
      header: 'Total Jobs',
      align: 'right',
      accessor: (item) => <span className="font-mono font-medium">{item.totalJobs}</span>,
    },
    {
      key: 'totalInvoiced',
      header: 'Total Invoiced',
      align: 'right',
      accessor: (item) => <span className="font-mono font-semibold">{formatCurrency(item.totalInvoiced)}</span>,
    },
    {
      key: 'totalPaid',
      header: 'Total Paid',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.totalPaid)}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      align: 'right',
      accessor: (item) => (
        <span
          className={`font-mono font-bold ${
            item.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
          }`}
        >
          {formatCurrency(item.outstandingBalance)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.customerId}
      isLoading={isLoading}
      emptyTitle="No customer data"
      emptyDescription="No customer records found for the selected period."
    />
  );
};
