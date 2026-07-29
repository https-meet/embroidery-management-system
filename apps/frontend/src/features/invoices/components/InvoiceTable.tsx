import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Archive, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { ROUTES } from '@/shared/constants/routes';
import type { InvoiceDto } from '../types/invoice.types';

export interface InvoiceTableProps {
  invoices: InvoiceDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onCancelClick: (invoice: InvoiceDto) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onCancelClick,
}) => {
  const columns: Column<InvoiceDto>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice ID',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.INVOICES.DETAIL(item.id)}
          className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline"
        >
          {item.invoiceNo}
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
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'invoiceDate',
      header: 'Issue Date',
      sortable: true,
      accessor: (item) => <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatDate(item.invoiceDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: (item) => <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatDate(item.dueDate || item.invoiceDate)}</span>,
    },
    {
      key: 'grandTotal',
      header: 'Grand Total',
      align: 'right',
      sortable: true,
      accessor: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
          {formatCurrency(item.grandTotal)}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      align: 'right',
      accessor: (item) => (
        <span
          className={`font-mono text-xs font-semibold tabular-nums ${
            item.outstandingBalance > 0
              ? 'text-destructive'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatCurrency(item.outstandingBalance)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link to={ROUTES.INVOICES.DETAIL(item.id)}>
            <Button variant="ghost" size="icon" title="View Invoice Workspace" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {item.status !== 'PAID' && item.status !== 'CANCELLED' && (
            <Link to={`${ROUTES.INVOICES.DETAIL(item.id)}/edit`}>
              <Button variant="ghost" size="icon" title="Edit Invoice" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {item.status !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="icon"
              title="Cancel Invoice"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onCancelClick(item)}
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
      data={invoices}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      emptyTitle="No invoices found"
      emptyDescription="There are no customer invoices matching your query. Generate a new invoice to get started."
    />
  );
};
