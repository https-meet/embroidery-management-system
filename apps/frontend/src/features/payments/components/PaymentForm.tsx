import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCustomers } from '@/features/customers';
import { useInvoices } from '@/features/invoices';
import { createPaymentSchema, type CreatePaymentFormValues } from '../schemas/payment.schema';

export interface PaymentFormProps {
  initialValues?: Partial<CreatePaymentFormValues>;
  onSubmit: (values: CreatePaymentFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const { data: customerData } = useCustomers({ limit: 100, isActive: true });
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      customerId: initialValues?.customerId || '',
      invoiceId: initialValues?.invoiceId || '',
      paymentDate: initialValues?.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: initialValues?.paymentMethod || 'UPI',
      amount: initialValues?.amount || 0,
      referenceNo: initialValues?.referenceNo || '',
      notes: initialValues?.notes || '',
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        customerId: initialValues.customerId || '',
        invoiceId: initialValues.invoiceId || '',
        paymentDate: initialValues.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: initialValues.paymentMethod || 'UPI',
        amount: initialValues.amount || 0,
        referenceNo: initialValues.referenceNo || '',
        notes: initialValues.notes || '',
      });
    }
  }, [initialValues, reset]);

  const watchedCustomerId = useWatch({ control, name: 'customerId' });
  const watchedInvoiceId = useWatch({ control, name: 'invoiceId' });

  // Fetch unpaid invoices for the selected customer
  const { data: invoiceData } = useInvoices({
    customerId: watchedCustomerId || undefined,
    limit: 100,
  });

  const selectedInvoice = (invoiceData?.invoices || []).find((inv) => inv.id === watchedInvoiceId);

  const handleFillMaxAmount = () => {
    if (selectedInvoice && selectedInvoice.outstandingBalance > 0) {
      setValue('amount', selectedInvoice.outstandingBalance);
    }
  };

  const { isBlocked, proceed, reset: cancelBlock } = useUnsavedChanges(isDirty);

  const handleFormSubmit = async (values: CreatePaymentFormValues) => {
    await onSubmit(values);
    reset(values);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer Select */}
        <FormField
          label="Customer"
          htmlFor="customerId"
          required
          error={errors.customerId?.message}
        >
          <select
            id="customerId"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('customerId')}
          >
            <option value="">Select a customer...</option>
            {(customerData?.customers || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customerCode})
              </option>
            ))}
          </select>
        </FormField>

        {/* Invoice Allocation Select */}
        <FormField
          label="Allocate to Invoice (optional)"
          htmlFor="invoiceId"
          error={errors.invoiceId?.message}
        >
          <select
            id="invoiceId"
            disabled={!watchedCustomerId}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            {...register('invoiceId')}
          >
            <option value="">Select invoice to allocate...</option>
            {(invoiceData?.invoices || [])
              .filter((inv) => inv.status !== 'VOID' && inv.status !== 'PAID')
              .map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNo} — Outstanding: {formatCurrency(inv.outstandingBalance)}
                </option>
              ))}
          </select>
        </FormField>

        {/* Selected Invoice Banner */}
        {selectedInvoice && (
          <div className="sm:col-span-2 flex items-center justify-between rounded-md border bg-muted/40 p-3 text-xs">
            <div>
              <span className="font-semibold text-foreground">Invoice #{selectedInvoice.invoiceNo}</span>
              <p className="text-muted-foreground">
                Grand Total: {formatCurrency(selectedInvoice.grandTotal)} | Balance Due:{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                  {formatCurrency(selectedInvoice.outstandingBalance)}
                </strong>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillMaxAmount}
              className="text-xs"
            >
              Fill Full Balance ({formatCurrency(selectedInvoice.outstandingBalance)})
            </Button>
          </div>
        )}

        {/* Payment Date */}
        <FormField
          label="Payment Date"
          htmlFor="paymentDate"
          error={errors.paymentDate?.message}
        >
          <Input
            id="paymentDate"
            type="date"
            error={Boolean(errors.paymentDate)}
            {...register('paymentDate')}
          />
        </FormField>

        {/* Payment Method */}
        <FormField
          label="Payment Method"
          htmlFor="paymentMethod"
          required
          error={errors.paymentMethod?.message}
        >
          <select
            id="paymentMethod"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('paymentMethod')}
          >
            <option value="UPI">UPI / QR Payment</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </FormField>

        {/* Payment Amount */}
        <FormField
          label="Payment Amount (₹)"
          htmlFor="amount"
          required
          error={errors.amount?.message}
        >
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            error={Boolean(errors.amount)}
            {...register('amount', { valueAsNumber: true })}
          />
        </FormField>

        {/* Reference Number */}
        <FormField
          label="Transaction / Reference / Cheque No. (optional)"
          htmlFor="referenceNo"
          error={errors.referenceNo?.message}
        >
          <Input
            id="referenceNo"
            placeholder="e.g. UPI/123456789 or CHQ-98765"
            error={Boolean(errors.referenceNo)}
            {...register('referenceNo')}
          />
        </FormField>

        {/* Notes */}
        <div className="sm:col-span-2">
          <FormField
            label="Remarks & Payment Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={2}
              placeholder="Received via PhonePe / Bank Reference details"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </FormField>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isLoading}>
          Record Payment Receipt
        </Button>
      </div>
    </form>

    <ConfirmDialog
      isOpen={isBlocked}
      title="Unsaved Changes"
      description="You have unsaved changes. Are you sure you want to leave?"
      confirmText="Leave Page"
      cancelText="Stay"
      isDestructive
      onConfirm={proceed}
      onCancel={cancelBlock}
    />
  </>
  );
};
