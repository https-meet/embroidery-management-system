import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateCustomerDto,
  CustomerDetailData,
  CustomerQueryParams,
  PaginatedCustomersData,
  UpdateCustomerDto,
} from '../types/customer.types';

/**
 * Customer Module API Functions
 */
export async function getCustomersApi(
  params?: CustomerQueryParams
): Promise<PaginatedCustomersData> {
  const response = (await axiosClient.get('/customers', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedCustomersData>;
  return response.data;
}

export async function getCustomerByIdApi(id: string): Promise<CustomerDetailData> {
  const response = (await axiosClient.get(
    `/customers/${id}`
  )) as unknown as ApiSuccessResponse<CustomerDetailData>;
  return response.data;
}

export async function createCustomerApi(dto: CreateCustomerDto): Promise<CustomerDetailData> {
  const response = (await axiosClient.post(
    '/customers',
    dto
  )) as unknown as ApiSuccessResponse<CustomerDetailData>;
  return response.data;
}

export async function updateCustomerApi(
  id: string,
  dto: UpdateCustomerDto
): Promise<CustomerDetailData> {
  const response = (await axiosClient.put(
    `/customers/${id}`,
    dto
  )) as unknown as ApiSuccessResponse<CustomerDetailData>;
  return response.data;
}

export async function archiveCustomerApi(id: string): Promise<void> {
  await axiosClient.delete(`/customers/${id}`);
}
