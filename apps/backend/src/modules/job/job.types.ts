import type { JobItemProductionStatus, JobStatus, Priority } from '@prisma/client';
import type { CustomerResponseDto } from '../customer/customer.types';
import type { DesignResponseDto } from '../design/design.types';

export interface JobItemResponseDto {
  id: string;
  jobId: string;
  designId: string | null;
  design?: DesignResponseDto | null;
  position: string;
  quantity: number;
  rate: number;
  lineTotal: number;
  threadColor: string | null;
  dimensions: string | null;
  remarks: string | null;
  productionStatus: JobItemProductionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobResponseDto {
  id: string;
  jobNo: string;
  customerId: string;
  customer?: CustomerResponseDto;
  jobDate: Date;
  expectedDeliveryDate: Date | null;
  priority: Priority;
  status: JobStatus;
  notes: string | null;
  createdBy: string | null;
  items: JobItemResponseDto[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
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
  priority?: Priority;
  notes?: string;
  items: CreateJobItemDto[];
}

export interface UpdateJobDto {
  jobDate?: string;
  expectedDeliveryDate?: string;
  priority?: Priority;
  status?: JobStatus;
  notes?: string;
}

export interface JobQueryFilter {
  search?: string;
  customerId?: string;
  status?: JobStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
  sortBy?: 'jobNo' | 'jobDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedJobsResponseDto {
  jobs: JobResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
