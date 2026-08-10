import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCustomers } from '@/features/customers';
import { useDesigns } from '@/features/designs';
import { createJobSchema, type CreateJobFormValues } from '../schemas/job.schema';

export interface JobFormProps {
  initialValues?: Partial<CreateJobFormValues>;
  onSubmit: (values: CreateJobFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const { data: customerData } = useCustomers({ limit: 100, isActive: true });
  const { data: designData } = useDesigns({ limit: 100, isActive: true });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      customerId: initialValues?.customerId || '',
      jobDate: initialValues?.jobDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: initialValues?.expectedDeliveryDate || '',
      priority: initialValues?.priority || 'NORMAL',
      notes: initialValues?.notes || '',
      items: initialValues?.items?.length
        ? initialValues.items
        : [
            {
              designId: '',
              position: 'Left Chest',
              quantity: 10,
              rate: 50,
              threadColor: '',
              dimensions: '',
              remarks: '',
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        customerId: initialValues.customerId || '',
        jobDate: initialValues.jobDate || new Date().toISOString().split('T')[0],
        expectedDeliveryDate: initialValues.expectedDeliveryDate || '',
        priority: initialValues.priority || 'NORMAL',
        notes: initialValues.notes || '',
        items: initialValues.items?.length
          ? initialValues.items
          : [
              {
                designId: '',
                position: 'Left Chest',
                quantity: 10,
                rate: 50,
                threadColor: '',
                dimensions: '',
                remarks: '',
              },
            ],
      });
    }
  }, [initialValues, reset]);

  // Watch line items to calculate live totals
  const watchedItems = useWatch({ control, name: 'items' }) || [];

  const grandTotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item?.quantity) || 0;
    const rate = Number(item?.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const { isBlocked, proceed, reset: cancelBlock } = useUnsavedChanges(isDirty);

  const handleFormSubmit = async (values: CreateJobFormValues) => {
    await onSubmit(values);
    reset(values);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Primary Order Information */}
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

        {/* Priority Select */}
        <FormField
          label="Order Priority"
          htmlFor="priority"
          required
          error={errors.priority?.message}
        >
          <select
            id="priority"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('priority')}
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </FormField>

        {/* Target Delivery Date */}
        <FormField
          label="Target Delivery Date (optional)"
          htmlFor="expectedDeliveryDate"
          error={errors.expectedDeliveryDate?.message}
        >
          <Input
            id="expectedDeliveryDate"
            type="date"
            error={Boolean(errors.expectedDeliveryDate)}
            {...register('expectedDeliveryDate')}
          />
        </FormField>
      </div>

      {/* Line Items Section */}
      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Job Line Items & Embroidery Specifications
            </h3>
            <p className="text-xs text-muted-foreground">
              Add embroidery positions, quantities, rates, and designs
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                designId: '',
                position: 'Back',
                quantity: 10,
                rate: 50,
                threadColor: '',
                dimensions: '',
                remarks: '',
              })
            }
            className="flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>

        {errors.items?.root?.message && (
          <p className="text-xs font-medium text-destructive">
            {errors.items.root.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const currentQty = Number(watchedItems[index]?.quantity) || 0;
            const currentRate = Number(watchedItems[index]?.rate) || 0;
            const lineTotal = currentQty * currentRate;

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-md border bg-card p-3 shadow-sm sm:grid-cols-12 sm:items-center"
              >
                {/* Design Select */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Design (optional)
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus-visible:outline-none"
                    {...register(`items.${index}.designId`)}
                  >
                    <option value="">Select design...</option>
                    {(designData?.designs || []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.designCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Position *
                  </label>
                  <Input
                    placeholder="e.g. Left Chest, Back"
                    className="h-9 text-xs"
                    error={Boolean(errors.items?.[index]?.position)}
                    {...register(`items.${index}.position`)}
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

                {/* Line Total & Remove */}
                <div className="sm:col-span-2 flex items-center justify-between pt-2 sm:pt-4">
                  <div className="text-right min-w-0">
                    <span className="text-[10px] text-muted-foreground block">Line Total</span>
                    <span className="text-xs font-bold font-mono text-foreground">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                      title="Remove item line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Grand Total Display */}
        <div className="flex items-center justify-between border-t pt-3 px-2">
          <span className="text-xs font-medium text-muted-foreground">
            Total Estimated Order Amount:
          </span>
          <span className="text-base font-bold font-mono text-foreground">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Notes */}
      <FormField
        label="Order Notes / Special Instructions (optional)"
        htmlFor="notes"
        error={errors.notes?.message}
      >
        <textarea
          id="notes"
          rows={3}
          placeholder="Special thread colors, deadline conditions, or packaging notes"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('notes')}
        />
      </FormField>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isLoading}>
          {initialValues ? 'Save Changes' : 'Create Job'}
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
