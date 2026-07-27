import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { archiveCustomerApi, createCustomerApi, updateCustomerApi } from '../api/customers.api';
import type { CreateCustomerDto, UpdateCustomerDto } from '../types/customer.types';

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => createCustomerApi(dto),
    onSuccess: (data) => {
      toast.success(`Customer '${data.customer.name}' created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCustomerDto }) =>
      updateCustomerApi(id, dto),
    onSuccess: (data, { id }) => {
      toast.success(`Customer '${data.customer.name}' updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveCustomerApi(id),
    onSuccess: (_, id) => {
      toast.success('Customer archived successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
