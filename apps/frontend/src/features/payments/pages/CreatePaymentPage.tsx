import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCreatePayment } from '../hooks/usePaymentMutations';
import { PaymentForm } from '../components/PaymentForm';
import type { CreatePaymentFormValues } from '../schemas/payment.schema';

export const CreatePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreatePayment();

  const handleSubmit = async (values: CreatePaymentFormValues) => {
    try {
      const allocations = values.invoiceId && values.amount > 0
        ? [
            {
              invoiceId: values.invoiceId,
              allocatedAmount: values.amount,
            },
          ]
        : undefined;

      const data = await createMutation.mutateAsync({
        customerId: values.customerId,
        paymentDate: values.paymentDate || undefined,
        paymentMethod: values.paymentMethod,
        referenceNo: values.referenceNo?.trim() || undefined,
        amount: values.amount,
        notes: values.notes?.trim() || undefined,
        allocations,
      });

      navigate(ROUTES.PAYMENTS.DETAIL(data.payment.id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the payment form.');
      } else {
        toast.error('Failed to record payment.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record New Payment"
        description="Issue an official payment receipt and allocate funds to customer invoices."
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <PaymentForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => navigate(ROUTES.PAYMENTS.LIST)}
        />
      </div>
    </div>
  );
};
