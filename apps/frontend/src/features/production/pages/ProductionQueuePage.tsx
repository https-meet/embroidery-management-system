import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ErrorState } from '@/shared/components/ErrorState';
import { useProductionQueue } from '../hooks/useProductionQueue';
import {
  useAssignOperator,
  useCompleteProduction,
  useRecordQualityCheck,
  useStartProduction,
} from '../hooks/useProductionMutations';
import { ProductionQueueTable } from '../components/ProductionQueueTable';
import { ProductionFilters } from '../components/ProductionFilters';
import { AssignOperatorModal } from '../components/AssignOperatorModal';
import { QualityCheckModal } from '../components/QualityCheckModal';
import type { JobDto, JobStatus } from '@/features/jobs';
import type { AssignOperatorFormValues, QualityCheckFormValues } from '../schemas/production.schema';

export const ProductionQueuePage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [assignedOperator, setAssignedOperatorState] = useState<string>('');
  const [status, setStatusState] = useState<JobStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'jobNo' | 'createdAt' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const assignModal = useDisclosure();
  const qcModal = useDisclosure();

  const handleOperatorChange = (op: string) => {
    setAssignedOperatorState(op);
    setPage(1);
  };

  const handleStatusChange = (st: JobStatus | undefined) => {
    setStatusState(st);
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useProductionQueue({
    page,
    limit,
    search,
    assignedOperator: assignedOperator || undefined,
    status,
    sortBy,
    sortOrder,
  });

  const startMutation = useStartProduction();
  const completeMutation = useCompleteProduction();
  const assignMutation = useAssignOperator();
  const qcMutation = useRecordQualityCheck();

  const handleSort = (columnKey: string) => {
    if (columnKey === 'jobNo' || columnKey === 'createdAt' || columnKey === 'priority') {
      if (sortBy === columnKey) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setPage(1);
    }
  };

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
    await assignMutation.mutateAsync({
      jobId: values.jobId,
      assignedOperator: values.assignedOperator.trim(),
    });
    assignModal.onClose();
    setSelectedJob(null);
  };

  const handleConfirmQC = async (values: QualityCheckFormValues) => {
    await qcMutation.mutateAsync({
      jobId: values.jobId,
      passed: values.passed,
      notes: values.notes?.trim() || undefined,
    });
    qcModal.onClose();
    setSelectedJob(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Work Queue"
        description="Monitor active embroidery jobs, operator assignments, and machine output."
      />

      <ProductionFilters
        search={search}
        onSearchChange={setSearch}
        assignedOperator={assignedOperator}
        onOperatorChange={handleOperatorChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load production queue"
          message="An error occurred while retrieving active production jobs."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <ProductionQueueTable
            jobs={data?.jobs || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
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
