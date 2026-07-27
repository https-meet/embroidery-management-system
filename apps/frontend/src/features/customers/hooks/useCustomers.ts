import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getCustomerByIdApi, getCustomersApi } from '../api/customers.api';
import type { CustomerQueryParams } from '../types/customer.types';

export function useCustomers(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => getCustomersApi(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => getCustomerByIdApi(id),
    enabled: Boolean(id),
  });
}
