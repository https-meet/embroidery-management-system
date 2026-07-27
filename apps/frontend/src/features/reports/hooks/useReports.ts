import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import {
  getCustomerReportApi,
  getInvoiceReportApi,
  getJobReportApi,
  getPaymentReportApi,
  getProductionReportApi,
  getRevenueReportApi,
} from '../api/reports.api';
import type { ReportFilterParams } from '../types/reports.types';

export function useRevenueReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.revenue(params),
    queryFn: () => getRevenueReportApi(params),
  });
}

export function useCustomerReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.customers(params),
    queryFn: () => getCustomerReportApi(params),
  });
}

export function useJobReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.jobs(params),
    queryFn: () => getJobReportApi(params),
  });
}

export function useProductionReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.production(params),
    queryFn: () => getProductionReportApi(params),
  });
}

export function useInvoiceReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.invoices(params),
    queryFn: () => getInvoiceReportApi(params),
  });
}

export function usePaymentReport(params?: ReportFilterParams) {
  return useQuery({
    queryKey: queryKeys.reports.payments(params),
    queryFn: () => getPaymentReportApi(params),
  });
}
