import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { designSchema, type DesignFormValues } from '../schemas/design.schema';

export interface DesignFormProps {
  initialValues?: Partial<DesignFormValues>;
  onSubmit: (values: DesignFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const DesignForm: React.FC<DesignFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      name: initialValues?.name || '',
      category: initialValues?.category || '',
      description: initialValues?.description || '',
      previewUrl: initialValues?.previewUrl || '',
      primaryFileUrl: initialValues?.primaryFileUrl || '',
      primaryFileType: initialValues?.primaryFileType || '',
      stitchCount: initialValues?.stitchCount ?? undefined,
      widthMm: initialValues?.widthMm ?? undefined,
      heightMm: initialValues?.heightMm ?? undefined,
      colorCount: initialValues?.colorCount ?? undefined,
      notes: initialValues?.notes || '',
      isActive: initialValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        category: initialValues.category || '',
        description: initialValues.description || '',
        previewUrl: initialValues.previewUrl || '',
        primaryFileUrl: initialValues.primaryFileUrl || '',
        primaryFileType: initialValues.primaryFileType || '',
        stitchCount: initialValues.stitchCount ?? undefined,
        widthMm: initialValues.widthMm ?? undefined,
        heightMm: initialValues.heightMm ?? undefined,
        colorCount: initialValues.colorCount ?? undefined,
        notes: initialValues.notes || '',
        isActive: initialValues.isActive ?? true,
      });
    }
  }, [initialValues, reset]);

  const isEditing = Boolean(initialValues?.name);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Design Name */}
        <FormField
          label="Design Name"
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="e.g. Floral Pocket Logo or School Emblem"
            error={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        {/* Category */}
        <FormField
          label="Category (optional)"
          htmlFor="category"
          error={errors.category?.message}
        >
          <Input
            id="category"
            placeholder="e.g. Badges, Logos, Floral"
            error={Boolean(errors.category)}
            {...register('category')}
          />
        </FormField>

        {/* Stitch Count */}
        <FormField
          label="Stitch Count (optional)"
          htmlFor="stitchCount"
          error={errors.stitchCount?.message}
        >
          <Input
            id="stitchCount"
            type="number"
            placeholder="e.g. 15000"
            error={Boolean(errors.stitchCount)}
            {...register('stitchCount', { valueAsNumber: true })}
          />
        </FormField>

        {/* Color Count */}
        <FormField
          label="Color Count (optional)"
          htmlFor="colorCount"
          error={errors.colorCount?.message}
        >
          <Input
            id="colorCount"
            type="number"
            placeholder="e.g. 6"
            error={Boolean(errors.colorCount)}
            {...register('colorCount', { valueAsNumber: true })}
          />
        </FormField>

        {/* Width (mm) */}
        <FormField
          label="Width in mm (optional)"
          htmlFor="widthMm"
          error={errors.widthMm?.message}
        >
          <Input
            id="widthMm"
            type="number"
            step="0.1"
            placeholder="e.g. 85.5"
            error={Boolean(errors.widthMm)}
            {...register('widthMm', { valueAsNumber: true })}
          />
        </FormField>

        {/* Height (mm) */}
        <FormField
          label="Height in mm (optional)"
          htmlFor="heightMm"
          error={errors.heightMm?.message}
        >
          <Input
            id="heightMm"
            type="number"
            step="0.1"
            placeholder="e.g. 90.0"
            error={Boolean(errors.heightMm)}
            {...register('heightMm', { valueAsNumber: true })}
          />
        </FormField>

        {/* Preview Image URL */}
        <FormField
          label="Preview Image URL (optional)"
          htmlFor="previewUrl"
          error={errors.previewUrl?.message}
        >
          <Input
            id="previewUrl"
            type="url"
            placeholder="e.g. https://storage.example.com/preview.png"
            error={Boolean(errors.previewUrl)}
            {...register('previewUrl')}
          />
        </FormField>

        {/* Primary File URL */}
        <FormField
          label="Primary Machine File URL (optional)"
          htmlFor="primaryFileUrl"
          error={errors.primaryFileUrl?.message}
        >
          <Input
            id="primaryFileUrl"
            type="url"
            placeholder="e.g. https://storage.example.com/logo.dst"
            error={Boolean(errors.primaryFileUrl)}
            {...register('primaryFileUrl')}
          />
        </FormField>

        {/* Description */}
        <div className="sm:col-span-2">
          <FormField
            label="Description (optional)"
            htmlFor="description"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={2}
              placeholder="Short description of the embroidery design"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('description')}
            />
          </FormField>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <FormField
            label="Machine & Thread Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={2}
              placeholder="Special thread colors, stabilizer, or machine setup notes"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </FormField>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isLoading}>
          {isEditing ? 'Save Changes' : 'Create Design'}
        </Button>
      </div>
    </form>
  );
};
