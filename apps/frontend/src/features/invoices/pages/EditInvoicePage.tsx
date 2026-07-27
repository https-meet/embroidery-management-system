import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useInvoice } from '../hooks/useInvoices';
import { useUpdateInvoice } from '../hooks/useInvoiceMutations';
import { InvoiceForm } from '../components/InvoiceForm';
import type { CreateInvoiceFormValues } from '../schemas/invoice.schema';

export const EditInvoicePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useInvoice(id);
  const updateMutation = useUpdateInvoice();

  const handleSubmit = async (values: CreateInvoiceFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          dueDate: values.dueDate || undefined,
          discountType: values.discountType,
          discountValue: values.discountValue,
          notes: values.notes?.trim() || undefined,
        },
      });

      navigate(ROUTES.INVOICES.DETAIL(id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the invoice form.');
      } else {
        toast.error('Failed to update invoice.');
      }
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Invoice" />
        <ErrorState
          title="Invoice Not Found"
          message="Could not load the invoice details for editing."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const initialValues: Partial<CreateInvoiceFormValues> = {
    customerId: data.invoice.customerId,
    invoiceDate: data.invoice.invoiceDate
      ? new Date(data.invoice.invoiceDate).toISOString().split('T')[0]
      : '',
    dueDate: data.invoice.dueDate
      ? new Date(data.invoice.dueDate).toISOString().split('T')[0]
      : '',
    discountType: data.invoice.discountType || 'FIXED',
    discountValue: data.invoice.discountValue ?? 0,
    notes: data.invoice.notes || '',
    items: data.invoice.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      rate: i.rate,
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Invoice ${data.invoice.invoiceNo}`}
        description={`Update payment due date, discount, or terms for ${data.invoice.invoiceNo}`}
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <InvoiceForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          onCancel={() => navigate(ROUTES.INVOICES.DETAIL(id))}
        />
      </div>
    </div>
  );
};
