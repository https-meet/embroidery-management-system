import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import {
  assignOperatorApi,
  completeProductionApi,
  markReadyForDeliveryApi,
  recordQualityCheckApi,
  startProductionApi,
} from '../api/production.api';
import type {
  AssignProductionDto,
  CompleteProductionDto,
  DeliveryReadinessDto,
  QualityCheckDto,
  StartProductionDto,
} from '../types/production.types';

export function useAssignOperator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AssignProductionDto) => assignOperatorApi(dto),
    onSuccess: (data) => {
      toast.success(`Assigned operator to job '${data.job.jobNo}'.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useStartProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StartProductionDto) => startProductionApi(dto),
    onSuccess: (data) => {
      toast.success(`Started production for job '${data.job.jobNo}'.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useCompleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CompleteProductionDto) => completeProductionApi(dto),
    onSuccess: (data) => {
      toast.success(`Production marked complete for job '${data.job.jobNo}'.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useRecordQualityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: QualityCheckDto) => recordQualityCheckApi(dto),
    onSuccess: (data) => {
      toast.success(`Quality check recorded for job '${data.job.jobNo}'.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}

export function useMarkReadyForDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: DeliveryReadinessDto) => markReadyForDeliveryApi(dto),
    onSuccess: (data) => {
      toast.success(`Job '${data.job.jobNo}' marked ready for delivery.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['customer360'] });
    },
  });
}
