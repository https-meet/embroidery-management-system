import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useJob } from '../hooks/useJobs';
import { useUpdateJob } from '../hooks/useJobMutations';
import { JobForm } from '../components/JobForm';
import type { CreateJobFormValues } from '../schemas/job.schema';

export const EditJobPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useJob(id);
  const updateMutation = useUpdateJob();

  useSetBreadcrumb(id, data?.job?.jobNo);


  const handleSubmit = async (values: CreateJobFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          customerId: values.customerId,
          jobDate: values.jobDate || undefined,
          expectedDeliveryDate: values.expectedDeliveryDate || undefined,
          priority: values.priority,
          notes: values.notes?.trim() || undefined,
          items: values.items.map((i) => ({
            designId: i.designId || undefined,
            position: i.position,
            quantity: i.quantity,
            rate: i.rate,
            threadColor: i.threadColor || undefined,
            dimensions: i.dimensions || undefined,
            remarks: i.remarks || undefined,
          })),
        },
      });

      navigate(ROUTES.JOBS.DETAIL(id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error('Failed to update job order.');
      }
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Job" />
        <ErrorState
          title="Job Not Found"
          message="Could not load the job details for editing."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const initialValues: Partial<CreateJobFormValues> = {
    customerId: data.job.customerId,
    jobDate: data.job.jobDate ? new Date(data.job.jobDate).toISOString().split('T')[0] : '',
    expectedDeliveryDate: data.job.expectedDeliveryDate
      ? new Date(data.job.expectedDeliveryDate).toISOString().split('T')[0]
      : '',
    priority: data.job.priority,
    notes: data.job.notes || '',
    items: data.job.items.map((i) => ({
      designId: i.designId || '',
      position: i.position,
      quantity: i.quantity,
      rate: i.rate,
      threadColor: i.threadColor || '',
      dimensions: i.dimensions || '',
      remarks: i.remarks || '',
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Job ${data.job.jobNo}`}
        description={`Update order priority, target delivery date, or notes for ${data.job.jobNo}`}
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <JobForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          onCancel={() => navigate(ROUTES.JOBS.DETAIL(id))}
        />
      </div>
    </div>
  );
};
