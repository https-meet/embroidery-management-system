import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCustomers } from '@/features/customers';
import { useJobs } from '@/features/jobs';
import { createInvoiceSchema, type CreateInvoiceFormValues } from '../schemas/invoice.schema';
import { InvoiceSummaryModal } from './InvoiceSummaryModal';

export interface InvoiceFormProps {
  initialValues?: Partial<CreateInvoiceFormValues>;
  onSubmit: (values: CreateInvoiceFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const [pendingValues, setPendingValues] = useState<CreateInvoiceFormValues | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);

  const { data: customerData } = useCustomers({ limit: 100, isActive: true });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customerId: initialValues?.customerId || '',
      invoiceDate: initialValues?.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: initialValues?.dueDate || '',
      discountType: initialValues?.discountType || 'FIXED_AMOUNT',
      discountValue: initialValues?.discountValue ?? 0,
      notes: initialValues?.notes || '',
      items: initialValues?.items?.length
        ? initialValues.items
        : [
            {
              description: 'Embroidery Work Item',
              quantity: 1,
              rate: 100,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedCustomerId = useWatch({ control, name: 'customerId' });
  const { data: customerJobsData } = useJobs(
    selectedCustomerId ? { customerId: selectedCustomerId, limit: 50 } : undefined,
  );

  useEffect(() => {
    if (initialValues) {
      reset({
        customerId: initialValues.customerId || '',
        invoiceDate: initialValues.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: initialValues.dueDate || '',
        discountType: initialValues.discountType || 'FIXED_AMOUNT',
        discountValue: initialValues.discountValue ?? 0,
        notes: initialValues.notes || '',
        items: initialValues.items?.length
          ? initialValues.items
          : [
              {
                description: 'Embroidery Work Item',
                quantity: 1,
                rate: 100,
              },
            ],
      });
    }
  }, [initialValues, reset]);

  const watchedItems = useWatch({ control, name: 'items' }) || [];
  const watchedDiscountType = useWatch({ control, name: 'discountType' });
  const watchedDiscountValue = Number(useWatch({ control, name: 'discountValue' })) || 0;

  const handleSmartAutoFill = () => {
    if (!customerJobsData?.jobs?.length) return;

    const autoItems: Array<{ description: string; quantity: number; rate: number; sourceJobId: string }> = [];
    customerJobsData.jobs.forEach((job) => {
      job.items.forEach((item) => {
        autoItems.push({
          sourceJobId: job.id,
          description: `Job ${job.jobNo}: ${item.position}${item.design ? ` (${item.design.name})` : ''}`,
          quantity: item.quantity,
          rate: item.rate,
        });
      });
    });

    if (autoItems.length > 0) {
      setValue('items', autoItems);
    }
  };

  const { isBlocked, proceed, reset: cancelBlock } = useUnsavedChanges(isDirty);

  const handleFormSubmit = (values: CreateInvoiceFormValues) => {
    setPendingValues(values);
    setIsSummaryOpen(true);
  };

  const handleConfirmInvoice = async () => {
    if (pendingValues) {
      await onSubmit(pendingValues);
      reset(pendingValues);
      setIsSummaryOpen(false);
    }
  };

  const subtotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item?.quantity) || 0;
    const rate = Number(item?.rate) || 0;
    return acc + qty * rate;
  }, 0);

  let discountAmount = 0;
  if (watchedDiscountType === 'PERCENTAGE') {
    discountAmount = (subtotal * watchedDiscountValue) / 100;
  } else {
    discountAmount = watchedDiscountValue;
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const grandTotal = subtotal - discountAmount;

  const selectedCustomerObj = customerData?.customers.find((c) => c.id === selectedCustomerId);

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Primary Customer & Date Controls */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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

          {/* Invoice Date */}
          <FormField
            label="Invoice Issue Date"
            htmlFor="invoiceDate"
            error={errors.invoiceDate?.message}
          >
            <Input
              id="invoiceDate"
              type="date"
              error={Boolean(errors.invoiceDate)}
              {...register('invoiceDate')}
            />
          </FormField>

          {/* Due Date */}
          <FormField
            label="Payment Due Date (optional)"
            htmlFor="dueDate"
            error={errors.dueDate?.message}
          >
            <Input
              id="dueDate"
              type="date"
              error={Boolean(errors.dueDate)}
              {...register('dueDate')}
            />
          </FormField>
        </div>

        {/* Smart Job Auto-Fill Banner */}
        {selectedCustomerId && Boolean(customerJobsData?.jobs?.length) && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Found <strong className="font-bold text-foreground">{customerJobsData?.jobs.length}</strong> active job order(s) for this customer.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSmartAutoFill}
              className="flex items-center space-x-1 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Auto-Fill Line Items</span>
            </Button>
          </div>
        )}

        {/* Discount Configuration */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-lg border bg-card p-4 shadow-sm">
          <FormField label="Discount Type" htmlFor="discountType">
            <select
              id="discountType"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('discountType')}
            >
              <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </FormField>

          <FormField
            label="Discount Value"
            htmlFor="discountValue"
            error={errors.discountValue?.message}
          >
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              error={Boolean(errors.discountValue)}
              {...register('discountValue', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        {/* Line Items Section */}
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Itemized Billing Line Items
              </h3>
              <p className="text-xs text-muted-foreground">
                Specify item descriptions, quantities, and rates manually or use smart auto-fill
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  description: 'Embroidery Work Item',
                  quantity: 1,
                  rate: 100,
                })
              }
              className="flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line Item</span>
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const currentQty = Number(watchedItems[index]?.quantity) || 0;
              const currentRate = Number(watchedItems[index]?.rate) || 0;
              const lineAmount = currentQty * currentRate;

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-md border bg-card p-3 shadow-sm sm:grid-cols-12 sm:items-center"
                >
                  {/* Description */}
                  <div className="sm:col-span-6">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Item Description *
                    </label>
                    <Input
                      placeholder="e.g. Logo Embroidery on T-Shirts"
                      className="h-9 text-xs"
                      error={Boolean(errors.items?.[index]?.description)}
                      {...register(`items.${index}.description`)}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Qty *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      className="h-9 text-xs font-mono"
                      error={Boolean(errors.items?.[index]?.quantity)}
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  {/* Rate */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Rate (₹) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-9 text-xs font-mono"
                      error={Boolean(errors.items?.[index]?.rate)}
                      {...register(`items.${index}.rate`, { valueAsNumber: true })}
                    />
                  </div>

                  {/* Amount & Delete */}
                  <div className="sm:col-span-2 flex items-center justify-between pt-2 sm:pt-4">
                    <div className="text-right min-w-0">
                      <span className="text-[10px] text-muted-foreground block">Amount</span>
                      <span className="text-xs font-bold font-mono text-foreground">
                        {formatCurrency(lineAmount)}
                      </span>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invoice Total Calculation Card */}
          <div className="border-t pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({watchedDiscountType === 'PERCENTAGE' ? `${watchedDiscountValue}%` : 'Fixed'}):</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  - {formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-foreground border-t pt-2">
              <span>Invoice Grand Total:</span>
              <span className="font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField
          label="Invoice Notes & Payment Terms (optional)"
          htmlFor="notes"
          error={errors.notes?.message}
        >
          <textarea
            id="notes"
            rows={3}
            placeholder="Payment due within 15 days of invoice date. Bank transfer details..."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('notes')}
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialValues ? 'Save Changes' : 'Review & Generate Invoice'}
          </Button>
        </div>
      </form>

      {/* Pre-submission Summary Preview Modal */}
      <InvoiceSummaryModal
        isOpen={isSummaryOpen}
        values={pendingValues}
        customerName={selectedCustomerObj?.name}
        isLoading={isLoading}
        onConfirm={handleConfirmInvoice}
        onCancel={() => setIsSummaryOpen(false)}
      />

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
