import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCreateInvoice } from '../hooks/useInvoiceMutations';
import { InvoiceForm } from '../components/InvoiceForm';
import type { CreateInvoiceFormValues } from '../schemas/invoice.schema';

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateInvoice();

  const handleSubmit = async (values: CreateInvoiceFormValues) => {
    try {
      const data = await createMutation.mutateAsync({
        customerId: values.customerId,
        invoiceDate: values.invoiceDate || undefined,
        dueDate: values.dueDate || undefined,
        discountType: values.discountType,
        discountValue: values.discountValue,
        notes: values.notes?.trim() || undefined,
        items: values.items?.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          rate: item.rate,
        })),
      });

      navigate(ROUTES.INVOICES.DETAIL(data.invoice.id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the invoice form.');
      } else {
        toast.error('Failed to create invoice.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Invoice"
        description="Generate a new billing invoice for customer embroidery services."
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <InvoiceForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => navigate(ROUTES.INVOICES.LIST)}
        />
      </div>
    </div>
  );
};
