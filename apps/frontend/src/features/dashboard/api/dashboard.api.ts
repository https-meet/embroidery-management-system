import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type { DashboardDataDto } from '../types/dashboard.types';

/**
 * Dashboard API Service Functions
 */
export async function getDashboardSummaryApi(): Promise<DashboardDataDto> {
  const response = (await axiosClient.get(
    '/dashboard/summary'
  )) as unknown as ApiSuccessResponse<DashboardDataDto>;
  return response.data;
}
