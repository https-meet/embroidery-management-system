import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCreateJob } from '../hooks/useJobMutations';
import { JobForm } from '../components/JobForm';
import type { CreateJobFormValues } from '../schemas/job.schema';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCustomerId = searchParams.get('customerId') || undefined;

  const createMutation = useCreateJob();

  const handleSubmit = async (values: CreateJobFormValues) => {
    try {
      const data = await createMutation.mutateAsync({
        customerId: values.customerId,
        jobDate: values.jobDate || undefined,
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        priority: values.priority,
        notes: values.notes?.trim() || undefined,
        items: values.items.map((item) => ({
          designId: item.designId || undefined,
          position: item.position.trim(),
          quantity: item.quantity,
          rate: item.rate,
          threadColor: item.threadColor?.trim() || undefined,
          dimensions: item.dimensions?.trim() || undefined,
          remarks: item.remarks?.trim() || undefined,
        })),
      });

      navigate(ROUTES.JOBS.DETAIL(data.job.id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the order form.');
      } else {
        toast.error('Failed to create job order.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Job Order"
        description="Create an embroidery job order with specifications and pricing."
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <JobForm
          initialValues={{ customerId: prefilledCustomerId }}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => navigate(ROUTES.JOBS.LIST)}
        />
      </div>
    </div>
  );
};
