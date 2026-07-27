import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  CustomerReportItemDto,
  InvoiceReportItemDto,
  JobReportItemDto,
  PaginatedReportData,
  PaymentReportItemDto,
  ProductionReportItemDto,
  ReportFilterParams,
  RevenueReportDto,
} from '../types/reports.types';

/**
 * Report Module API Functions
 */
export async function getRevenueReportApi(
  params?: ReportFilterParams
): Promise<RevenueReportDto> {
  const response = (await axiosClient.get('/reports/revenue', {
    params,
  })) as unknown as ApiSuccessResponse<RevenueReportDto>;
  return response.data;
}

export async function getCustomerReportApi(
  params?: ReportFilterParams
): Promise<PaginatedReportData<CustomerReportItemDto>> {
  const response = (await axiosClient.get('/reports/customers', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedReportData<CustomerReportItemDto>>;
  return response.data;
}

export async function getJobReportApi(
  params?: ReportFilterParams
): Promise<PaginatedReportData<JobReportItemDto>> {
  const response = (await axiosClient.get('/reports/jobs', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedReportData<JobReportItemDto>>;
  return response.data;
}

export async function getProductionReportApi(
  params?: ReportFilterParams
): Promise<PaginatedReportData<ProductionReportItemDto>> {
  const response = (await axiosClient.get('/reports/production', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedReportData<ProductionReportItemDto>>;
  return response.data;
}

export async function getInvoiceReportApi(
  params?: ReportFilterParams
): Promise<PaginatedReportData<InvoiceReportItemDto>> {
  const response = (await axiosClient.get('/reports/invoices', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedReportData<InvoiceReportItemDto>>;
  return response.data;
}

export async function getPaymentReportApi(
  params?: ReportFilterParams
): Promise<PaginatedReportData<PaymentReportItemDto>> {
  const response = (await axiosClient.get('/reports/payments', {
    params,
  })) as unknown as ApiSuccessResponse<PaginatedReportData<PaymentReportItemDto>>;
  return response.data;
}
