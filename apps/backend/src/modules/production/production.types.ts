import type { JobItemProductionStatus, JobStatus } from '@prisma/client';
import type { JobResponseDto } from '../job/job.types';

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

export interface ProductionQueryFilter {
  search?: string;
  assignedOperator?: string;
  status?: JobStatus;
  productionStatus?: JobItemProductionStatus;
  page?: number;
  limit?: number;
  sortBy?: 'jobNo' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductionQueueResponseDto {
  jobs: JobResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
