import React from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { PaymentReportItemDto } from '../types/reports.types';

export interface PaymentReportTableProps {
  items: PaymentReportItemDto[];
  isLoading?: boolean;
}

export const PaymentReportTable: React.FC<PaymentReportTableProps> = ({ items, isLoading }) => {
  const columns: Column<PaymentReportItemDto>[] = [
    {
      key: 'paymentNo',
      header: 'Receipt No.',
      accessor: (item) => <span className="font-mono font-bold text-foreground">{item.paymentNo}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      accessor: (item) => <span className="font-semibold text-foreground">{item.customerName}</span>,
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      accessor: (item) => formatDate(item.paymentDate),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      accessor: (item) => (
        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase">
          {item.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'referenceNo',
      header: 'Reference / Txn ID',
      accessor: (item) => (item.referenceNo ? <span className="font-mono text-xs text-muted-foreground">{item.referenceNo}</span> : '—'),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.paymentId}
      isLoading={isLoading}
      emptyTitle="No payment data"
      emptyDescription="No payment audit records found for the selected period."
    />
  );
};
