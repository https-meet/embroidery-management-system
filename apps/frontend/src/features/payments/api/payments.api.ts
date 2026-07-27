import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreatePaymentDto,
  PaginatedPaymentsData,
  PaymentDetailData,
  PaymentQueryParams,
} from '../types/payment.types';

/**
 * Payment Module API Functions
 */
export async function getPaymentsApi(
  params?: PaymentQueryParams
): Promise<PaginatedPaymentsData> {
  const response = (await axiosClient.get('/payments', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedPaymentsData>;
  return response.data;
}

export async function getPaymentByIdApi(id: string): Promise<PaymentDetailData> {
  const response = (await axiosClient.get(
    `/payments/${id}`
  )) as unknown as ApiSuccessResponse<PaymentDetailData>;
  return response.data;
}

export async function createPaymentApi(dto: CreatePaymentDto): Promise<PaymentDetailData> {
  const response = (await axiosClient.post(
    '/payments',
    dto
  )) as unknown as ApiSuccessResponse<PaymentDetailData>;
  return response.data;
}
