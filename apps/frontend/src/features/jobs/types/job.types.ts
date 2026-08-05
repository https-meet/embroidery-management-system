import type { PaginationParams } from '@/shared/types/api.types';
import type { CustomerDto } from '@/features/customers';
import type { DesignDto } from '@/features/designs';

export type JobStatus =
  | 'DRAFT'
  | 'PENDING_PRODUCTION'
  | 'IN_PRODUCTION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';
export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type JobItemProductionStatus = 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';

export interface JobItemDto {
  id: string;
  jobId: string;
  designId: string | null;
  design?: DesignDto | null;
  position: string;
  quantity: number;
  rate: number;
  lineTotal: number;
  threadColor: string | null;
  dimensions: string | null;
  remarks: string | null;
  productionStatus: JobItemProductionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobDto {
  id: string;
  jobNo: string;
  customerId: string;
  customer?: CustomerDto;
  jobDate: string;
  expectedDeliveryDate: string | null;
  priority: JobPriority;
  status: JobStatus;
  assignedOperator: string | null;
  startedAt: string | null;
  completedAt: string | null;
  qualityCheckedAt: string | null;
  qualityCheckedBy: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdBy: string | null;
  items: JobItemDto[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobItemDto {
  designId?: string;
  position: string;
  quantity: number;
  rate: number;
  threadColor?: string;
  dimensions?: string;
  remarks?: string;
}

export interface CreateJobDto {
  customerId: string;
  jobDate?: string;
  expectedDeliveryDate?: string;
  priority?: JobPriority;
  notes?: string;
  items: CreateJobItemDto[];
}

export interface UpdateJobDto {
  customerId?: string;
  jobDate?: string;
  expectedDeliveryDate?: string;
  priority?: JobPriority;
  status?: JobStatus;
  notes?: string;
  items?: CreateJobItemDto[];
}

export interface JobQueryParams extends PaginationParams {
  search?: string;
  customerId?: string;
  status?: JobStatus;
  priority?: JobPriority;
  page?: number;
  limit?: number;
  sortBy?: 'jobNo' | 'jobDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedJobsData {
  jobs: JobDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobDetailData {
  job: JobDto;
}
