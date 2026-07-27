import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCreateDesign } from '../hooks/useDesignMutations';
import { DesignForm } from '../components/DesignForm';
import type { DesignFormValues } from '../schemas/design.schema';

const sanitizeNum = (val: unknown): number | undefined =>
  typeof val === 'number' && !isNaN(val) ? val : undefined;

export const CreateDesignPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDesign();

  const handleSubmit = async (values: DesignFormValues) => {
    try {
      const data = await createMutation.mutateAsync({
        name: values.name.trim(),
        category: values.category?.trim() || undefined,
        description: values.description?.trim() || undefined,
        previewUrl: values.previewUrl?.trim() || undefined,
        primaryFileUrl: values.primaryFileUrl?.trim() || undefined,
        primaryFileType: values.primaryFileType?.trim() || undefined,
        stitchCount: sanitizeNum(values.stitchCount),
        widthMm: sanitizeNum(values.widthMm),
        heightMm: sanitizeNum(values.heightMm),
        colorCount: sanitizeNum(values.colorCount),
        notes: values.notes?.trim() || undefined,
      });

      navigate(ROUTES.DESIGNS.DETAIL(data.design.id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error('Failed to create design.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Design"
        description="Register a new embroidery pattern into the catalog."
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <DesignForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => navigate(ROUTES.DESIGNS.LIST)}
        />
      </div>
    </div>
  );
};
