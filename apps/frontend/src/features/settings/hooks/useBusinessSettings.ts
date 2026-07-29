import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosClient } from '@/shared/api';

export interface BusinessConfig {
  companyName: string;
  gstin?: string;
  pan?: string;
  website?: string;
  address?: string;
  mobile?: string;
  email?: string;
  taxRatePercent: number;
  defaultTaxRatePercentage?: number;
  currencySymbol: string;
  invoicePrefix: string;
  jobPrefix: string;
  paymentPrefix?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  upiId?: string;
  defaultPaymentTermsDays?: number;
  invoiceFooter?: string;
}

export interface SystemHealthData {
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  appVersion?: string;
  systemUptimeSeconds?: number;
  environment?: string;
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs: number;
  };
  storage: {
    backupsAvailable: number;
    lastBackupTimestamp: string | null;
  };
  system: {
    nodeVersion: string;
    environment: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
  };
  recordCounts?: {
    customers: number;
    jobs: number;
    designs: number;
    invoices: number;
    payments: number;
  };
}

interface ApiDataWrapper<T> {
  data: T;
}

export function useBusinessSettings() {
  return useQuery<{ config: BusinessConfig }>({
    queryKey: ['businessConfig'],
    queryFn: async () => {
      const res = await axiosClient.get('/settings/business');
      const payload = res as unknown as ApiDataWrapper<{ config: BusinessConfig }>;
      return payload.data;
    },
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: Partial<BusinessConfig>) => {
      const res = await axiosClient.put('/settings/business', dto);
      const payload = res as unknown as ApiDataWrapper<{ config: BusinessConfig }>;
      return payload.data;
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
      const payload = res as unknown as ApiDataWrapper<SystemHealthData>;
      return payload.data;
    },
    refetchInterval: 30000,
  });
}
