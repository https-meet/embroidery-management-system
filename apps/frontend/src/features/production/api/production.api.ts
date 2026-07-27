import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type { JobDto } from '@/features/jobs';
import type {
  AssignProductionDto,
  CompleteProductionDto,
  DeliveryReadinessDto,
  PaginatedProductionQueueData,
  ProductionQueryFilter,
  QualityCheckDto,
  StartProductionDto,
} from '../types/production.types';

/**
 * Production Work Queue API Functions
 */
export async function getProductionQueueApi(
  params?: ProductionQueryFilter
): Promise<PaginatedProductionQueueData> {
  const response = (await axiosClient.get('/production', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedProductionQueueData>;
  return response.data;
}

export async function assignOperatorApi(
  dto: AssignProductionDto
): Promise<{ job: JobDto }> {
  const response = (await axiosClient.post(
    '/production/assign',
    dto
  )) as unknown as ApiSuccessResponse<{ job: JobDto }>;
  return response.data;
}

export async function startProductionApi(
  dto: StartProductionDto
): Promise<{ job: JobDto }> {
  const response = (await axiosClient.post(
    '/production/start',
    dto
  )) as unknown as ApiSuccessResponse<{ job: JobDto }>;
  return response.data;
}

export async function completeProductionApi(
  dto: CompleteProductionDto
): Promise<{ job: JobDto }> {
  const response = (await axiosClient.post(
    '/production/complete',
    dto
  )) as unknown as ApiSuccessResponse<{ job: JobDto }>;
  return response.data;
}

export async function recordQualityCheckApi(
  dto: QualityCheckDto
): Promise<{ job: JobDto }> {
  const response = (await axiosClient.post(
    '/production/quality-check',
    dto
  )) as unknown as ApiSuccessResponse<{ job: JobDto }>;
  return response.data;
}

export async function markReadyForDeliveryApi(
  dto: DeliveryReadinessDto
): Promise<{ job: JobDto }> {
  const response = (await axiosClient.post(
    '/production/deliver',
    dto
  )) as unknown as ApiSuccessResponse<{ job: JobDto }>;
  return response.data;
}
