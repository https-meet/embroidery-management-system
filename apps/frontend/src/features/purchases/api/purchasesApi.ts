import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreatePurchaseInput,
  PaginatedPurchasesResponse,
  Purchase,
  PurchaseQueryFilters,
} from '../types/purchases.types';

export const purchasesApi = {
  list: async (filters?: PurchaseQueryFilters): Promise<PaginatedPurchasesResponse> => {
    const response = (await axiosClient.get('/purchases', {
      params: filters,
    })) as unknown as ApiSuccessResponse<PaginatedPurchasesResponse>;
    return response.data;
  },

  getById: async (id: string): Promise<Purchase> => {
    const response = (await axiosClient.get(`/purchases/${id}`)) as unknown as ApiSuccessResponse<{ purchase: Purchase }>;
    return response.data.purchase;
  },

  create: async (data: CreatePurchaseInput): Promise<Purchase> => {
    const response = (await axiosClient.post('/purchases', data)) as unknown as ApiSuccessResponse<{ purchase: Purchase }>;
    return response.data.purchase;
  },
};
