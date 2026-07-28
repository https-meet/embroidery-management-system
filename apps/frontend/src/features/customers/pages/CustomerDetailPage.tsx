import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ROUTES } from '@/shared/constants/routes';
import { useCustomer360 } from '../hooks/useCustomer360';
import { useArchiveCustomer } from '../hooks/useCustomerMutations';
import { CustomerWorkspace } from '../components/CustomerWorkspace';

export const CustomerDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const archiveDialog = useDisclosure();

  const { data, isLoading, isError, refetch } = useCustomer360(id);
  const archiveMutation = useArchiveCustomer();

  const handleConfirmArchive = async () => {
    if (id) {
      await archiveMutation.mutateAsync(id);
      archiveDialog.onClose();
      navigate(ROUTES.CUSTOMERS.LIST);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer 360° Overview" />
        <ErrorState
          title="Customer Not Found"
          message="The requested customer record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.customer.name}
        description={`Customer 360° Workspace (${data.customer.customerCode})`}
      />

      <CustomerWorkspace
        data={data}
        onArchiveClick={archiveDialog.onOpen}
      />

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Customer?"
        description={`Are you sure you want to archive '${data.customer.name}'? Historical records remain available.`}
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
