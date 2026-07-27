import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { useInvoices } from '../hooks/useInvoices';
import { useCancelInvoice } from '../hooks/useInvoiceMutations';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoiceFilters } from '../components/InvoiceFilters';
import type { InvoiceDto, InvoiceStatus } from '../types/invoice.types';

export const InvoicesListPage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [status, setStatusState] = useState<InvoiceStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'invoiceNo' | 'invoiceDate' | 'createdAt' | 'grandTotal' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const cancelDialog = useDisclosure();

  const handleStatusChange = (st: InvoiceStatus | undefined) => {
    setStatusState(st);
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useInvoices({
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder,
  });

  const cancelMutation = useCancelInvoice();

  const handleSort = (columnKey: string) => {
    if (
      columnKey === 'invoiceNo' ||
      columnKey === 'invoiceDate' ||
      columnKey === 'createdAt' ||
      columnKey === 'grandTotal' ||
      columnKey === 'status'
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

  const handleCancelClick = (invoice: InvoiceDto) => {
    setSelectedInvoice(invoice);
    cancelDialog.onOpen();
  };

  const handleConfirmCancel = async () => {
    if (selectedInvoice) {
      await cancelMutation.mutateAsync(selectedInvoice.id);
      cancelDialog.onClose();
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage customer billing statements, itemized totals, and invoice statuses."
        action={
          <Link to={ROUTES.INVOICES.CREATE}>
            <Button size="sm" className="flex items-center space-x-1.5">
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Button>
          </Link>
        }
      />

      <InvoiceFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load invoices"
          message="An error occurred while retrieving invoice records."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <InvoiceTable
            invoices={data?.invoices || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onCancelClick={handleCancelClick}
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

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        title="Cancel Invoice?"
        description={`Are you sure you want to cancel invoice '${selectedInvoice?.invoiceNo}'? This action will mark the invoice as CANCELLED.`}
        confirmText="Cancel Invoice"
        cancelText="Keep Active"
        isDestructive
        isLoading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={cancelDialog.onClose}
      />
    </div>
  );
};
