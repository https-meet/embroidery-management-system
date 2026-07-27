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
import { useCustomers } from '../hooks/useCustomers';
import { useArchiveCustomer } from '../hooks/useCustomerMutations';
import { CustomerTable } from '../components/CustomerTable';
import { CustomerFilters } from '../components/CustomerFilters';
import type { CustomerDto, CustomerType } from '../types/customer.types';

export const CustomersListPage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [customerType, setCustomerTypeState] = useState<CustomerType | undefined>(undefined);
  const [isActive, setIsActiveState] = useState<boolean | undefined>(true);
  const [sortBy, setSortBy] = useState<'name' | 'customerCode' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const archiveDialog = useDisclosure();

  const handleCustomerTypeChange = (type: CustomerType | undefined) => {
    setCustomerTypeState(type);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleStatusChange = (status: boolean | undefined) => {
    setIsActiveState(status);
    setPage(1); // Reset to page 1 on filter change
  };

  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    limit,
    search,
    customerType,
    isActive,
    sortBy,
    sortOrder,
  });

  const archiveMutation = useArchiveCustomer();

  const handleSort = (columnKey: string) => {
    if (columnKey === 'name' || columnKey === 'customerCode' || columnKey === 'createdAt') {
      if (sortBy === columnKey) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setPage(1);
    }
  };

  const handleArchiveClick = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    archiveDialog.onOpen();
  };

  const handleConfirmArchive = async () => {
    if (selectedCustomer) {
      await archiveMutation.mutateAsync(selectedCustomer.id);
      archiveDialog.onClose();
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer profiles, contact records, and business relationships."
        action={
          <Link to={ROUTES.CUSTOMERS.CREATE}>
            <Button size="sm" className="flex items-center space-x-1.5">
              <Plus className="h-4 w-4" />
              <span>New Customer</span>
            </Button>
          </Link>
        }
      />

      <CustomerFilters
        search={search}
        onSearchChange={setSearch}
        customerType={customerType}
        onTypeChange={handleCustomerTypeChange}
        isActive={isActive}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load customers"
          message="An error occurred while retrieving customer records."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <CustomerTable
            customers={data?.customers || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onArchiveClick={handleArchiveClick}
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

      {/* Confirm Archive Dialog (ADR-003: Never say Delete) */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Customer?"
        description={`Are you sure you want to archive '${selectedCustomer?.name}'? The customer will no longer appear in active lists but historical records will be preserved.`}
        confirmText="Archive"
        cancelText="Cancel"
        isDestructive
        isLoading={archiveMutation.isPending}
        onConfirm={handleConfirmArchive}
        onCancel={archiveDialog.onClose}
      />
    </div>
  );
};
