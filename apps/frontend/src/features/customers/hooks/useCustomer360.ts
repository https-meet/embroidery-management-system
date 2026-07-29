import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/api';

export interface Customer360Response {
  customer: {
    id: string;
    customerCode: string;
    customerType: string;
    name: string;
    contactPerson?: string;
    mobile?: string;
    alternateMobile?: string;
    email?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    lifetimeRevenue: number;
    outstandingBalance: number;
    totalJobs: number;
    activeJobs: number;
    lastOrderDate: string | null;
  };
  jobs: Array<{
    id: string;
    jobNo: string;
    status: string;
    priority: string;
    jobDate: string;
    expectedDeliveryDate: string | null;
    items: Array<{ id: string }>;
  }>;
  invoices: Array<{
    id: string;
    invoiceNo: string;
    status: string;
    grandTotal: number;
    outstandingBalance: number;
    invoiceDate: string;
  }>;
  payments: Array<{
    id: string;
    paymentNo: string;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    paymentDate: string;
  }>;
  timeline: Array<{
    id: string;
    type: 'JOB' | 'INVOICE' | 'PAYMENT';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

interface ApiDataWrapper<T> {
  data: T;
}

export function useCustomer360(customerId: string) {
  return useQuery<Customer360Response>({
    queryKey: ['customer360', customerId],
    queryFn: async () => {
      const res = await axiosClient.get(`/customers/${customerId}/360`);
      const payload = res as unknown as ApiDataWrapper<Customer360Response>;
      return payload.data;
    },
    enabled: Boolean(customerId),
  });
}
