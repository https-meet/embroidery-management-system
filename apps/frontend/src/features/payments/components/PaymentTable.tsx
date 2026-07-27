import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CreditCard } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { ROUTES } from '@/shared/constants/routes';
import type { PaymentDto, PaymentMethod } from '../types/payment.types';

export interface PaymentTableProps {
  payments: PaymentDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
}

const MethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  return (
    <span className="inline-flex items-center space-x-1 rounded bg-muted px-2 py-0.5 text-xs font-semibold text-foreground uppercase">
      <CreditCard className="h-3 w-3 text-muted-foreground" />
      <span>{method.replace('_', ' ')}</span>
    </span>
  );
};

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const columns: Column<PaymentDto>[] = [
    {
      key: 'paymentNo',
      header: 'Receipt / Payment No.',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.PAYMENTS.DETAIL(item.id)}
          className="font-mono font-bold text-foreground hover:text-primary hover:underline"
        >
          {item.paymentNo}
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
      key: 'paymentMethod',
      header: 'Payment Method',
      accessor: (item) => <MethodBadge method={item.paymentMethod} />,
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      sortable: true,
      accessor: (item) => formatDate(item.paymentDate),
    },
    {
      key: 'referenceNo',
      header: 'Reference / Txn ID',
      accessor: (item) =>
        item.referenceNo ? (
          <span className="font-mono text-xs text-muted-foreground">{item.referenceNo}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      accessor: (item) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link to={ROUTES.PAYMENTS.DETAIL(item.id)}>
            <Button variant="ghost" size="icon" title="View Payment Receipt" className="h-8 w-8">
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
      data={payments}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      emptyTitle="No payments recorded"
      emptyDescription="There are no payment records matching your query. Record a payment to get started."
    />
  );
};
