import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Archive, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { ROUTES } from '@/shared/constants/routes';
import type { CustomerDto } from '../types/customer.types';

export interface CustomerTableProps {
  customers: CustomerDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onArchiveClick: (customer: CustomerDto) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onArchiveClick,
}) => {
  const columns: Column<CustomerDto>[] = [
    {
      key: 'customerCode',
      header: 'Customer Code',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.CUSTOMERS.DETAIL(item.id)}
          className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline"
        >
          {item.customerCode}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Customer / Business Name',
      sortable: true,
      accessor: (item) => (
        <div>
          <span className="font-semibold text-foreground">{item.name}</span>
          {item.contactPerson && (
            <p className="text-xs text-muted-foreground">Contact: {item.contactPerson}</p>
          )}
        </div>
      ),
    },
    {
      key: 'customerType',
      header: 'Segment',
      accessor: (item) => (
        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border border-border">
          {item.customerType}
        </span>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile Number',
      accessor: (item) => item.mobile ? <span className="font-mono text-xs tabular-nums">{item.mobile}</span> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      accessor: (item) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (item) => (
        <StatusBadge status={item.isActive ? 'COMPLETED' : 'CANCELLED'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link to={ROUTES.CUSTOMERS.DETAIL(item.id)}>
            <Button variant="ghost" size="icon" title="View Customer Workspace" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`${ROUTES.CUSTOMERS.DETAIL(item.id)}/edit`}>
            <Button variant="ghost" size="icon" title="Edit Customer" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          {item.isActive && (
            <Button
              variant="ghost"
              size="icon"
              title="Archive Customer"
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
      data={customers}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      emptyTitle="No customers found"
      emptyDescription="There are no customers matching your query. Create a new customer to get started."
    />
  );
};
