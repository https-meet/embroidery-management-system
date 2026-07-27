import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getJobByIdApi, getJobsApi } from '../api/jobs.api';
import type { JobQueryParams } from '../types/job.types';

export function useJobs(params?: JobQueryParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => getJobsApi(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => getJobByIdApi(id),
    enabled: Boolean(id),
  });
}
