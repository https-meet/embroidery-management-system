import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ROUTES } from '@/shared/constants/routes';
import { useInvoice } from '../hooks/useInvoices';
import { useCancelInvoice } from '../hooks/useInvoiceMutations';
import { InvoiceWorkspace } from '../components/InvoiceWorkspace';

export const InvoiceDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cancelDialog = useDisclosure();

  const { data, isLoading, isError, refetch } = useInvoice(id);
  const cancelMutation = useCancelInvoice();

  const handleConfirmCancel = async () => {
    if (id) {
      await cancelMutation.mutateAsync(id);
      cancelDialog.onClose();
      navigate(ROUTES.INVOICES.LIST);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Details" />
        <ErrorState
          title="Invoice Not Found"
          message="The requested invoice record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.invoice.invoiceNo}
        description={`Invoice Workspace — ${data.invoice.customer?.name || 'Customer Statement'}`}
      />

      <InvoiceWorkspace
        invoice={data.invoice}
        onCancelClick={cancelDialog.onOpen}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        title="Cancel Invoice?"
        description={`Are you sure you want to cancel invoice '${data.invoice.invoiceNo}'?`}
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
