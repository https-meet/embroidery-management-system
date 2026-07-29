import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { cancelInvoiceApi, createInvoiceApi, updateInvoiceApi } from '../api/invoices.api';
import type { CreateInvoiceDto, UpdateInvoiceDto } from '../types/invoice.types';

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => createInvoiceApi(dto),
    onSuccess: (data) => {
      toast.success(`Invoice '${data.invoice.invoiceNo}' generated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInvoiceDto }) =>
      updateJobInvoiceApi(id, dto),
    onSuccess: (data, { id }) => {
      toast.success(`Invoice '${data.invoice.invoiceNo}' updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

function updateJobInvoiceApi(id: string, dto: UpdateInvoiceDto) {
  return updateInvoiceApi(id, dto);
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelInvoiceApi(id),
    onSuccess: (data, id) => {
      toast.success(`Invoice '${data.invoice.invoiceNo}' cancelled.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}
