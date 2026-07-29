import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { archiveJobApi, createJobApi, updateJobApi } from '../api/jobs.api';
import type { CreateJobDto, UpdateJobDto } from '../types/job.types';

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateJobDto) => createJobApi(dto),
    onSuccess: (data) => {
      toast.success(`Job '${data.job.jobNo}' created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateJobDto }) =>
      updateJobApi(id, dto),
    onSuccess: (data, { id }) => {
      toast.success(`Job '${data.job.jobNo}' updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useArchiveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveJobApi(id),
    onSuccess: (_, id) => {
      toast.success('Job archived successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}
