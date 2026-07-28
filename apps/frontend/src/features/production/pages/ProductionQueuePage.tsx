import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { usePagination } from '@/shared/hooks/usePagination';
import type { JobDto, JobStatus } from '@/features/jobs';
import {
  useAssignOperator,
  useCompleteProduction,
  useRecordQualityCheck,
  useStartProduction,
} from '../hooks/useProductionMutations';
import { useProductionQueue } from '../hooks/useProductionQueue';
import type { AssignOperatorFormValues, QualityCheckFormValues } from '../schemas/production.schema';
import { AssignOperatorModal } from '../components/AssignOperatorModal';
import { ProductionFilters } from '../components/ProductionFilters';
import { ProductionQueueTable } from '../components/ProductionQueueTable';
import { QualityCheckModal } from '../components/QualityCheckModal';

export const ProductionQueuePage: React.FC = () => {
  const [search, setSearchState] = useState<string>('');
  const [assignedOperator, setAssignedOperatorState] = useState<string>('');
  const [status, setStatusState] = useState<JobStatus | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);

  const assignModal = useDisclosure();
  const qcModal = useDisclosure();
  const { page, limit, setPage, setLimit } = usePagination();

  const handleSearchChange = (val: string) => {
    setSearchState(val);
    setPage(1);
  };

  const handleOperatorChange = (val: string) => {
    setAssignedOperatorState(val);
    setPage(1);
  };

  const handleStatusChange = (val?: JobStatus) => {
    setStatusState(val);
    setPage(1);
  };

  const filterParams = {
    search: search || undefined,
    assignedOperator: assignedOperator || undefined,
    status,
    page,
    limit,
  };

  const { data, isLoading, isError, refetch } = useProductionQueue(filterParams);
  const startMutation = useStartProduction();
  const completeMutation = useCompleteProduction();
  const assignMutation = useAssignOperator();
  const qcMutation = useRecordQualityCheck();

  const handleStartClick = async (job: JobDto) => {
    await startMutation.mutateAsync({ jobId: job.id });
  };

  const handleCompleteClick = async (job: JobDto) => {
    await completeMutation.mutateAsync({ jobId: job.id });
  };

  const handleAssignClick = (job: JobDto) => {
    setSelectedJob(job);
    assignModal.onOpen();
  };

  const handleQualityCheckClick = (job: JobDto) => {
    setSelectedJob(job);
    qcModal.onOpen();
  };

  const handleConfirmAssign = async (values: AssignOperatorFormValues) => {
    const targetJobId = selectedJob?.id || values.jobId;
    if (!targetJobId) return;

    await assignMutation.mutateAsync({
      jobId: targetJobId,
      assignedOperator: values.assignedOperator.trim(),
    });
    assignModal.onClose();
    setSelectedJob(null);
  };

  const handleConfirmQC = async (values: QualityCheckFormValues) => {
    const targetJobId = selectedJob?.id || values.jobId;
    if (!targetJobId) return;

    await qcMutation.mutateAsync({
      jobId: targetJobId,
      passed: values.passed,
      notes: values.notes?.trim() || undefined,
    });
    qcModal.onClose();
    setSelectedJob(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Queue & Operations"
        description="Monitor active embroidery jobs, operator assignments, and machine output."
      />

      <ProductionFilters
        search={search}
        assignedOperator={assignedOperator}
        status={status}
        onSearchChange={handleSearchChange}
        onOperatorChange={handleOperatorChange}
        onStatusChange={handleStatusChange}
      />

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <ErrorState
          title="Failed to load production queue"
          message="An error occurred while fetching machine production orders."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <ProductionQueueTable
            jobs={data?.jobs || []}
            onStartClick={handleStartClick}
            onCompleteClick={handleCompleteClick}
            onAssignClick={handleAssignClick}
            onQualityCheckClick={handleQualityCheckClick}
          />

          {data && (
            <PaginationBar
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          )}
        </div>
      )}

      {/* Assign Operator Modal */}
      {selectedJob && (
        <AssignOperatorModal
          isOpen={assignModal.isOpen}
          jobId={selectedJob.id}
          jobNo={selectedJob.jobNo}
          currentOperator={selectedJob.assignedOperator}
          isLoading={assignMutation.isPending}
          onConfirm={handleConfirmAssign}
          onCancel={assignModal.onClose}
        />
      )}

      {/* Quality Check Modal */}
      {selectedJob && (
        <QualityCheckModal
          isOpen={qcModal.isOpen}
          jobId={selectedJob.id}
          jobNo={selectedJob.jobNo}
          isLoading={qcMutation.isPending}
          onConfirm={handleConfirmQC}
          onCancel={qcModal.onClose}
        />
      )}
    </div>
  );
};
