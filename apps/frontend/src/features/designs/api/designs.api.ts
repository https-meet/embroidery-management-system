import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateDesignDto,
  DesignDetailData,
  DesignQueryParams,
  PaginatedDesignsData,
  UpdateDesignDto,
} from '../types/design.types';

/**
 * Design Catalog API Functions
 */
export async function getDesignsApi(
  params?: DesignQueryParams
): Promise<PaginatedDesignsData> {
  const response = (await axiosClient.get('/designs', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedDesignsData>;
  return response.data;
}

export async function getDesignByIdApi(id: string): Promise<DesignDetailData> {
  const response = (await axiosClient.get(
    `/designs/${id}`
  )) as unknown as ApiSuccessResponse<DesignDetailData>;
  return response.data;
}

export async function createDesignApi(dto: CreateDesignDto): Promise<DesignDetailData> {
  const response = (await axiosClient.post(
    '/designs',
    dto
  )) as unknown as ApiSuccessResponse<DesignDetailData>;
  return response.data;
}

export async function updateDesignApi(
  id: string,
  dto: UpdateDesignDto
): Promise<DesignDetailData> {
  const response = (await axiosClient.put(
    `/designs/${id}`,
    dto
  )) as unknown as ApiSuccessResponse<DesignDetailData>;
  return response.data;
}

export async function archiveDesignApi(id: string): Promise<void> {
  await axiosClient.delete(`/designs/${id}`);
}
