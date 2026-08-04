import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateSupplierInput,
  PaginatedSuppliersResponse,
  Supplier,
  SupplierQueryFilters,
  UpdateSupplierInput,
} from '../types/suppliers.types';

export const suppliersApi = {
  list: async (filters?: SupplierQueryFilters): Promise<PaginatedSuppliersResponse> => {
    const response = (await axiosClient.get('/suppliers', {
      params: filters,
    })) as unknown as ApiSuccessResponse<PaginatedSuppliersResponse>;
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = (await axiosClient.get(`/suppliers/${id}`)) as unknown as ApiSuccessResponse<{ supplier: Supplier }>;
    return response.data.supplier;
  },

  create: async (data: CreateSupplierInput): Promise<Supplier> => {
    const response = (await axiosClient.post('/suppliers', data)) as unknown as ApiSuccessResponse<{ supplier: Supplier }>;
    return response.data.supplier;
  },

  update: async (id: string, data: UpdateSupplierInput): Promise<Supplier> => {
    const response = (await axiosClient.patch(`/suppliers/${id}`, data)) as unknown as ApiSuccessResponse<{ supplier: Supplier }>;
    return response.data.supplier;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<Supplier> => {
    const response = (await axiosClient.patch(`/suppliers/${id}/status`, { isActive })) as unknown as ApiSuccessResponse<{ supplier: Supplier }>;
    return response.data.supplier;
  },
};
