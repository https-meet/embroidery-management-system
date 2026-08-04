import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateMaterialInput,
  Material,
  MaterialQueryFilters,
  PaginatedMaterialsResponse,
  UpdateMaterialInput,
} from '../types/materials.types';

export const materialsApi = {
  list: async (filters?: MaterialQueryFilters): Promise<PaginatedMaterialsResponse> => {
    const response = (await axiosClient.get('/materials', {
      params: filters,
    })) as unknown as ApiSuccessResponse<PaginatedMaterialsResponse>;
    return response.data;
  },

  getById: async (id: string): Promise<Material> => {
    const response = (await axiosClient.get(`/materials/${id}`)) as unknown as ApiSuccessResponse<{ material: Material }>;
    return response.data.material;
  },

  create: async (data: CreateMaterialInput): Promise<{ material: Material; skuWarning?: string }> => {
    const response = (await axiosClient.post('/materials', data)) as unknown as ApiSuccessResponse<{ material: Material; skuWarning?: string }>;
    return response.data;
  },

  update: async (id: string, data: UpdateMaterialInput): Promise<{ material: Material; skuWarning?: string }> => {
    const response = (await axiosClient.patch(`/materials/${id}`, data)) as unknown as ApiSuccessResponse<{ material: Material; skuWarning?: string }>;
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<Material> => {
    const response = (await axiosClient.patch(`/materials/${id}/status`, { isActive })) as unknown as ApiSuccessResponse<{ material: Material }>;
    return response.data.material;
  },
};
