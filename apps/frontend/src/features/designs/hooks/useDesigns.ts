import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getDesignByIdApi, getDesignsApi } from '../api/designs.api';
import type { DesignQueryParams } from '../types/design.types';

export function useDesigns(params?: DesignQueryParams) {
  return useQuery({
    queryKey: queryKeys.designs.list(params),
    queryFn: () => getDesignsApi(params),
  });
}

export function useDesign(id: string) {
  return useQuery({
    queryKey: queryKeys.designs.detail(id),
    queryFn: () => getDesignByIdApi(id),
    enabled: Boolean(id),
  });
}
