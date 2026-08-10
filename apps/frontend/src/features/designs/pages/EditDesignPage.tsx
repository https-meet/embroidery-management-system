import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useDesign } from '../hooks/useDesigns';
import { useUpdateDesign } from '../hooks/useDesignMutations';
import { DesignForm } from '../components/DesignForm';
import type { DesignFormValues } from '../schemas/design.schema';

const sanitizeNum = (val: unknown): number | undefined =>
  typeof val === 'number' && !isNaN(val) ? val : undefined;

export const EditDesignPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useDesign(id);
  const updateMutation = useUpdateDesign();

  useSetBreadcrumb(id, data?.design?.designCode || data?.design?.name);


  const handleSubmit = async (values: DesignFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
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
        },
      });

      navigate(ROUTES.DESIGNS.DETAIL(id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error('Failed to update design.');
      }
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.design) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Design" />
        <ErrorState
          title="Design Not Found"
          message="Could not load the design details for editing."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const initialValues: Partial<DesignFormValues> = {
    name: data.design.name,
    category: data.design.category || '',
    description: data.design.description || '',
    previewUrl: data.design.previewUrl || '',
    primaryFileUrl: data.design.primaryFileUrl || '',
    primaryFileType: data.design.primaryFileType || '',
    stitchCount: data.design.stitchCount ?? undefined,
    widthMm: data.design.widthMm ?? undefined,
    heightMm: data.design.heightMm ?? undefined,
    colorCount: data.design.colorCount ?? undefined,
    notes: data.design.notes || '',
    isActive: data.design.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${data.design.name}`}
        description={`Update design specifications for ${data.design.designCode}`}
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <DesignForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          onCancel={() => navigate(ROUTES.DESIGNS.DETAIL(id))}
        />
      </div>
    </div>
  );
};
