import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/shared/api';
import { toast } from 'sonner';

export interface BusinessConfig {
  companyName: string;
  logoUrl?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  bankName?: string | null;
  accountNo?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  upiQrUrl?: string | null;
  invoiceFooter?: string | null;
  jobPrefix: string;
  invoicePrefix: string;
  paymentPrefix: string;
  defaultTaxRatePercentage: number;
  defaultPaymentTermsDays: number;
}

export interface SystemHealthData {
  appVersion: string;
  environment: string;
  database: {
    status: 'HEALTHY' | 'DEGRADED';
    latencyMs: number;
    provider: string;
  };
  systemUptimeSeconds: number;
  recordCounts: {
    customers: number;
    jobs: number;
    invoices: number;
    payments: number;
    designs: number;
  };
  backupStatus: string;
}

export function useBusinessSettings() {
  return useQuery<{ config: BusinessConfig }>({
    queryKey: ['businessConfig'],
    queryFn: async () => {
      const res = await axiosClient.get('/settings/business');
      return (res as any).data;
    },
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: Partial<BusinessConfig>) => {
      const res = await axiosClient.put('/settings/business', dto);
      return (res as any).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] });
      toast.success('Business configuration updated in database successfully.');
    },
    onError: () => {
      toast.error('Failed to update business configuration.');
    },
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealthData>({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await axiosClient.get('/settings/health');
      return (res as any).data;
    },
    refetchInterval: 30000,
  });
}
