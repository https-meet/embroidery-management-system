import type { PaymentMethod, PaymentStatus } from '@prisma/client';
import type { CustomerResponseDto } from '../customer/customer.types';

export interface PaymentAllocationResponseDto {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponseDto {
  id: string;
  paymentNo: string;
  customerId: string;
  customer?: CustomerResponseDto;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNo: string | null;
  amount: number;
  status: PaymentStatus;
  notes: string | null;
  allocations: PaymentAllocationResponseDto[];
  createdAt: Date;
  updatedAt: Date;
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

export interface PaymentQueryFilter {
  search?: string;
  customerId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
  sortBy?: 'paymentNo' | 'paymentDate' | 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPaymentsResponseDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
