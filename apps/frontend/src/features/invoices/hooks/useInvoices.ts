import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getInvoiceByIdApi, getInvoicesApi } from '../api/invoices.api';
import type { InvoiceQueryParams } from '../types/invoice.types';

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => getInvoicesApi(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => getInvoiceByIdApi(id),
    enabled: Boolean(id),
  });
}
