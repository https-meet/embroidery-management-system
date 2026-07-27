import type { PaginationParams } from '@/shared/types/api.types';
import type { JobDto, JobStatus, JobItemProductionStatus } from '@/features/jobs';

export interface AssignProductionDto {
  jobId: string;
  assignedOperator: string;
}

export interface StartProductionDto {
  jobId: string;
}

export interface CompleteProductionDto {
  jobId: string;
  notes?: string;
}

export interface QualityCheckDto {
  jobId: string;
  passed: boolean;
  notes?: string;
}

export interface DeliveryReadinessDto {
  jobId: string;
}

export interface ProductionQueryFilter extends PaginationParams {
  search?: string;
  assignedOperator?: string;
  status?: JobStatus;
  productionStatus?: JobItemProductionStatus;
  page?: number;
  limit?: number;
  sortBy?: 'jobNo' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductionQueueData {
  jobs: JobDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
