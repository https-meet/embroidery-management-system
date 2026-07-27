import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { businessSettingsSchema, type BusinessSettingsFormValues } from '../schemas/settings.schema';
import type { BusinessSettingsDto } from '../types/settings.types';

export interface BusinessSettingsFormProps {
  initialValues: BusinessSettingsDto;
  onSave: (values: BusinessSettingsDto) => void;
}

export const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
  initialValues,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          label="Company / Firm Name"
          htmlFor="companyName"
          required
          error={errors.companyName?.message}
        >
          <Input
            id="companyName"
            placeholder="e.g. Antigravity Embroidery Works"
            error={Boolean(errors.companyName)}
            {...register('companyName')}
          />
        </FormField>

        <FormField
          label="GSTIN / Tax Registration No."
          htmlFor="gstin"
          error={errors.gstin?.message}
        >
          <Input
            id="gstin"
            placeholder="e.g. 24AAAAA0000A1Z5"
            error={Boolean(errors.gstin)}
            {...register('gstin')}
          />
        </FormField>

        <FormField
          label="Contact Mobile"
          htmlFor="mobile"
          error={errors.mobile?.message}
        >
          <Input
            id="mobile"
            placeholder="+91 98765 43210"
            error={Boolean(errors.mobile)}
            {...register('mobile')}
          />
        </FormField>

        <FormField
          label="Contact Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="info@embroidery.com"
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField
            label="Business Address"
            htmlFor="address"
            error={errors.address?.message}
          >
            <textarea
              id="address"
              rows={2}
              placeholder="Factory address for invoice header..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('address')}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            label="Bank Account Details (Invoice Footer)"
            htmlFor="bankDetails"
            error={errors.bankDetails?.message}
          >
            <textarea
              id="bankDetails"
              rows={2}
              placeholder="Bank Name, Account Number, IFSC Code..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('bankDetails')}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            label="Default Invoice Terms & Notes"
            htmlFor="defaultNotes"
            error={errors.defaultNotes?.message}
          >
            <textarea
              id="defaultNotes"
              rows={2}
              placeholder="Default terms printed on generated customer invoices..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('defaultNotes')}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Save Business Profile
        </Button>
      </div>
    </form>
  );
};
