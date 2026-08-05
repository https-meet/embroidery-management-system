import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema';
import { useDuplicateCustomerCheck } from '../hooks/useDuplicateCustomerCheck';

export interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || '',
      customerType: initialValues?.customerType || 'INDIVIDUAL',
      contactPerson: initialValues?.contactPerson || '',
      mobile: initialValues?.mobile || '',
      alternateMobile: initialValues?.alternateMobile || '',
      email: initialValues?.email || '',
      address: initialValues?.address || '',
      notes: initialValues?.notes || '',
      isActive: initialValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        customerType: initialValues.customerType || 'INDIVIDUAL',
        contactPerson: initialValues.contactPerson || '',
        mobile: initialValues.mobile || '',
        alternateMobile: initialValues.alternateMobile || '',
        email: initialValues.email || '',
        address: initialValues.address || '',
        notes: initialValues.notes || '',
        isActive: initialValues.isActive ?? true,
      });
    }
  }, [initialValues, reset]);

  // Watch name and mobile for duplicate check (BR-005)
  const watchedName = useWatch({ control, name: 'name' }) || '';
  const watchedMobile = useWatch({ control, name: 'mobile' }) || '';

  // Only run duplicate check when creating a new customer
  const isEditing = Boolean(initialValues?.name);
  const { duplicate } = useDuplicateCustomerCheck(
    isEditing ? '' : watchedName,
    isEditing ? '' : watchedMobile
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Duplicate Warning Banner (BR-005: Non-blocking warning) */}
      {duplicate && (
        <div className="flex items-start space-x-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="font-semibold">Potential Duplicate Customer Detected</span>
            <p>
              A customer named <strong className="font-semibold">{duplicate.name}</strong> ({duplicate.customerCode}) already exists. You can still proceed if this is a different customer.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer Name */}
        <FormField
          label="Customer / Business Name"
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="e.g. Acme Textile Corp or John Doe"
            error={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        {/* Customer Type */}
        <FormField
          label="Customer Type"
          htmlFor="customerType"
          required
          error={errors.customerType?.message}
        >
          <select
            id="customerType"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('customerType')}
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </select>
        </FormField>

        {/* Contact Person */}
        <FormField
          label="Contact Person (optional)"
          htmlFor="contactPerson"
          error={errors.contactPerson?.message}
        >
          <Input
            id="contactPerson"
            placeholder="e.g. Ramesh Kumar"
            error={Boolean(errors.contactPerson)}
            {...register('contactPerson')}
          />
        </FormField>

        {/* Mobile Number */}
        <FormField
          label="Mobile Number (optional)"
          htmlFor="mobile"
          error={errors.mobile?.message}
        >
          <Input
            id="mobile"
            placeholder="e.g. 9876543210"
            error={Boolean(errors.mobile)}
            {...register('mobile')}
          />
        </FormField>

        {/* Alternate Mobile */}
        <FormField
          label="Alternate Mobile (optional)"
          htmlFor="alternateMobile"
          error={errors.alternateMobile?.message}
        >
          <Input
            id="alternateMobile"
            placeholder="e.g. 9123456789"
            error={Boolean(errors.alternateMobile)}
            {...register('alternateMobile')}
          />
        </FormField>

        {/* Email Address */}
        <FormField
          label="Email Address (optional)"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="e.g. contact@acme.com"
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        {/* Address */}
        <div className="sm:col-span-2">
          <FormField
            label="Address (optional)"
            htmlFor="address"
            error={errors.address?.message}
          >
            <textarea
              id="address"
              rows={4}
              placeholder="Full business or delivery address"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('address')}
            />
          </FormField>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <FormField
            label="Internal Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={2}
              placeholder="Special instructions or customer preferences"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </FormField>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isLoading}>
          {isEditing ? 'Save Changes' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};
