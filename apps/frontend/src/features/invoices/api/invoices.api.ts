import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CreateInvoiceDto,
  InvoiceDetailData,
  InvoiceQueryParams,
  PaginatedInvoicesData,
  UpdateInvoiceDto,
} from '../types/invoice.types';

/**
 * Invoice Module API Functions
 */
export async function getInvoicesApi(
  params?: InvoiceQueryParams
): Promise<PaginatedInvoicesData> {
  const response = (await axiosClient.get('/invoices', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedInvoicesData>;
  return response.data;
}

export async function getInvoiceByIdApi(id: string): Promise<InvoiceDetailData> {
  const response = (await axiosClient.get(
    `/invoices/${id}`
  )) as unknown as ApiSuccessResponse<InvoiceDetailData>;
  return response.data;
}

export async function createInvoiceApi(dto: CreateInvoiceDto): Promise<InvoiceDetailData> {
  const response = (await axiosClient.post(
    '/invoices',
    dto
  )) as unknown as ApiSuccessResponse<InvoiceDetailData>;
  return response.data;
}

export async function updateInvoiceApi(
  id: string,
  dto: UpdateInvoiceDto
): Promise<InvoiceDetailData> {
  const response = (await axiosClient.put(
    `/invoices/${id}`,
    dto
  )) as unknown as ApiSuccessResponse<InvoiceDetailData>;
  return response.data;
}

export async function cancelInvoiceApi(id: string): Promise<InvoiceDetailData> {
  const response = (await axiosClient.post(
    `/invoices/${id}/cancel`
  )) as unknown as ApiSuccessResponse<InvoiceDetailData>;
  return response.data;
}
