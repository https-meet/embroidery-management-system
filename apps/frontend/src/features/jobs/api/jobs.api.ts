import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateJobDto,
  JobDetailData,
  JobQueryParams,
  PaginatedJobsData,
  UpdateJobDto,
} from '../types/job.types';

/**
 * Job Management API Functions
 */
export async function getJobsApi(
  params?: JobQueryParams
): Promise<PaginatedJobsData> {
  const response = (await axiosClient.get('/jobs', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedJobsData>;
  return response.data;
}

export async function getJobByIdApi(id: string): Promise<JobDetailData> {
  const response = (await axiosClient.get(
    `/jobs/${id}`
  )) as unknown as ApiSuccessResponse<JobDetailData>;
  return response.data;
}

export async function createJobApi(dto: CreateJobDto): Promise<JobDetailData> {
  const response = (await axiosClient.post(
    '/jobs',
    dto
  )) as unknown as ApiSuccessResponse<JobDetailData>;
  return response.data;
}

export async function updateJobApi(
  id: string,
  dto: UpdateJobDto
): Promise<JobDetailData> {
  const response = (await axiosClient.put(
    `/jobs/${id}`,
    dto
  )) as unknown as ApiSuccessResponse<JobDetailData>;
  return response.data;
}

export async function archiveJobApi(id: string): Promise<void> {
  await axiosClient.delete(`/jobs/${id}`);
}
