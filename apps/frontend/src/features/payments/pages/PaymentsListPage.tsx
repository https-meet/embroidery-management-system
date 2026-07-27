import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { usePayments } from '../hooks/usePayments';
import { PaymentTable } from '../components/PaymentTable';
import { PaymentFilters } from '../components/PaymentFilters';
import type { PaymentMethod, PaymentStatus } from '../types/payment.types';

export const PaymentsListPage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod | undefined>(undefined);
  const [status, setStatusState] = useState<PaymentStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'paymentNo' | 'paymentDate' | 'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleMethodChange = (method: PaymentMethod | undefined) => {
    setPaymentMethodState(method);
    setPage(1);
  };

  const handleStatusChange = (st: PaymentStatus | undefined) => {
    setStatusState(st);
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = usePayments({
    page,
    limit,
    search,
    paymentMethod,
    status,
    sortBy,
    sortOrder,
  });

  const handleSort = (columnKey: string) => {
    if (
      columnKey === 'paymentNo' ||
      columnKey === 'paymentDate' ||
      columnKey === 'createdAt' ||
      columnKey === 'amount'
    ) {
      if (sortBy === columnKey) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Receipts"
        description="Monitor customer payment receipts, transaction history, and invoice allocations."
        action={
          <Link to={ROUTES.PAYMENTS.CREATE}>
            <Button size="sm" className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </Button>
          </Link>
        }
      />

      <PaymentFilters
        search={search}
        onSearchChange={setSearch}
        paymentMethod={paymentMethod}
        onMethodChange={handleMethodChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load payments"
          message="An error occurred while retrieving payment transactions."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <PaymentTable
            payments={data?.payments || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {data && (
            <PaginationBar
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          )}
        </div>
      )}
    </div>
  );
};
