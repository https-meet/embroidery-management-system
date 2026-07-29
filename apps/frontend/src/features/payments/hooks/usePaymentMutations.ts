import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { createPaymentApi } from '../api/payments.api';
import type { CreatePaymentDto } from '../types/payment.types';

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => createPaymentApi(dto),
    onSuccess: (data) => {
      toast.success(`Payment '${data.payment.paymentNo}' recorded successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}
