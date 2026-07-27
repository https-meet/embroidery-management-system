import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { getPaymentByIdApi, getPaymentsApi } from '../api/payments.api';
import type { PaymentQueryParams } from '../types/payment.types';

export function usePayments(params?: PaymentQueryParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => getPaymentsApi(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => getPaymentByIdApi(id),
    enabled: Boolean(id),
  });
}
