import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { useJobs } from '../hooks/useJobs';
import { useArchiveJob } from '../hooks/useJobMutations';
import { JobTable } from '../components/JobTable';
import { JobFilters } from '../components/JobFilters';
import type { JobDto, JobPriority, JobStatus } from '../types/job.types';

export const JobsListPage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [status, setStatusState] = useState<JobStatus | undefined>(undefined);
  const [priority, setPriorityState] = useState<JobPriority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'jobNo' | 'jobDate' | 'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const archiveDialog = useDisclosure();

  const handleStatusChange = (st: JobStatus | undefined) => {
    setStatusState(st);
    setPage(1);
  };

  const handlePriorityChange = (pr: JobPriority | undefined) => {
    setPriorityState(pr);
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useJobs({
    page,
    limit,
    search,
    status,
    priority,
    sortBy,
    sortOrder,
  });

  const archiveMutation = useArchiveJob();

  const handleSort = (columnKey: string) => {
    if (
      columnKey === 'jobNo' ||
      columnKey === 'jobDate' ||
      columnKey === 'createdAt' ||
      columnKey === 'priority' ||
      columnKey === 'status'
    ) {
      if (sortBy === columnKey) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setPage(1);
    }
  };

  const handleArchiveClick = (job: JobDto) => {
    setSelectedJob(job);
    archiveDialog.onOpen();
  };

  const handleConfirmArchive = async () => {
    if (selectedJob) {
      await archiveMutation.mutateAsync(selectedJob.id);
      archiveDialog.onClose();
      setSelectedJob(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Embroidery Jobs"
        description="Manage customer orders, production workflow statuses, and line items."
        action={
          <Link to={ROUTES.JOBS.CREATE}>
            <Button size="sm" className="flex items-center space-x-1.5">
              <Plus className="h-4 w-4" />
              <span>New Job Order</span>
            </Button>
          </Link>
        }
      />

      <JobFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
        priority={priority}
        onPriorityChange={handlePriorityChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load jobs"
          message="An error occurred while retrieving job order records."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <JobTable
            jobs={data?.jobs || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onArchiveClick={handleArchiveClick}
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

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Job Order?"
        description={`This will remove job '${selectedJob?.jobNo}' from the active job list. The job will remain stored as an archived record.`}
        confirmText="Archive Job"
        cancelText="Keep Job"
        isDestructive
        isLoading={archiveMutation.isPending}
        onConfirm={handleConfirmArchive}
        onCancel={archiveDialog.onClose}
      />
    </div>
  );
};
