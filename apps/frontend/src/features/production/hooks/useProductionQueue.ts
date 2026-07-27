import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getProductionQueueApi } from '../api/production.api';
import type { ProductionQueryFilter } from '../types/production.types';

export function useProductionQueue(params?: ProductionQueryFilter) {
  return useQuery({
    queryKey: queryKeys.production.list(params),
    queryFn: () => getProductionQueueApi(params),
  });
}
