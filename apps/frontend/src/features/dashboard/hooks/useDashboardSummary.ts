import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getDashboardSummaryApi } from '../api/dashboard.api';
import type { DashboardDataDto } from '../types/dashboard.types';

export function useDashboardSummary() {
  return useQuery<DashboardDataDto>({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: getDashboardSummaryApi,
    staleTime: 30 * 1000, // 30 seconds for real-time dashboard updates
  });
}
