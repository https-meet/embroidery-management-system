import type { PaginationParams } from '@/shared/types/api.types';
import type { CustomerDto } from '@/features/customers';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
export type PaymentStatus = 'RECORDED' | 'CANCELLED';

export interface PaymentAllocationDto {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDto {
  id: string;
  paymentNo: string;
  customerId: string;
  customer?: CustomerDto;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNo: string | null;
  amount: number;
  status: PaymentStatus;
  notes: string | null;
  allocations: PaymentAllocationDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentAllocationDto {
  invoiceId: string;
  allocatedAmount: number;
}

export interface CreatePaymentDto {
  customerId: string;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  amount: number;
  notes?: string;
  allocations?: CreatePaymentAllocationDto[];
}

export interface PaymentQueryParams extends PaginationParams {
  search?: string;
  customerId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
  sortBy?: 'paymentNo' | 'paymentDate' | 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPaymentsData {
  payments: PaymentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentDetailData {
  payment: PaymentDto;
}
