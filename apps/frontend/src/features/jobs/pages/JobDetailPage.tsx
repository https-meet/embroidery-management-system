import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/ui/button';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ROUTES } from '@/shared/constants/routes';
import { useJob } from '../hooks/useJobs';
import { useArchiveJob, useUpdateJob } from '../hooks/useJobMutations';
import { JobWorkspace } from '../components/JobWorkspace';
import type { JobStatus } from '../types/job.types';

export const JobDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const archiveDialog = useDisclosure();

  const { data, isLoading, isError, refetch } = useJob(id);
  const updateMutation = useUpdateJob();
  const archiveMutation = useArchiveJob();

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (id) {
      await updateMutation.mutateAsync({
        id,
        dto: { status: newStatus },
      });
    }
  };

  const handleConfirmArchive = async () => {
    if (id) {
      await archiveMutation.mutateAsync(id);
      archiveDialog.onClose();
      navigate(ROUTES.JOBS.LIST);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Job Details" />
        <ErrorState
          title="Job Not Found"
          message="The requested job order could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.job.jobNo}
        description={`Job Workspace — ${data.job.customer?.name || 'Customer Order'}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.JOBS.LIST)}
            className="flex items-center space-x-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
        }
      />

      <JobWorkspace
        job={data.job}
        onStatusChange={handleStatusChange}
        onArchiveClick={archiveDialog.onOpen}
        isUpdatingStatus={updateMutation.isPending}
      />

      {/* Confirm Archive / Cancel Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Cancel Job Order?"
        description={`Are you sure you want to cancel job '${data.job.jobNo}'?`}
        confirmText="Cancel Order"
        cancelText="Keep Job"
        isDestructive
        isLoading={archiveMutation.isPending}
        onConfirm={handleConfirmArchive}
        onCancel={archiveDialog.onClose}
      />
    </div>
  );
};
