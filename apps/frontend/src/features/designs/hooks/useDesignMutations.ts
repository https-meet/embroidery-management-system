import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/shared/constants/queryKeys';
import { archiveDesignApi, createDesignApi, updateDesignApi } from '../api/designs.api';
import type { CreateDesignDto, UpdateDesignDto } from '../types/design.types';

export function useCreateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDesignDto) => createDesignApi(dto),
    onSuccess: (data) => {
      toast.success(`Design '${data.design.name}' created successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.designs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDesignDto }) =>
      updateDesignApi(id, dto),
    onSuccess: (data, { id }) => {
      toast.success(`Design '${data.design.name}' updated successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.designs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.designs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useArchiveDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveDesignApi(id),
    onSuccess: (_, id) => {
      toast.success('Design archived successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.designs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.designs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
