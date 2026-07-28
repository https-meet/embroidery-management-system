import type { PaginationParams } from '@/shared/types/api.types';
import type { CustomerDto } from '@/features/customers';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT';

export interface InvoiceItemDto {
  id: string;
  invoiceId: string;
  sourceJobId: string | null;
  sourceJobItemRef: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNo: string;
  customerId: string;
  customer?: CustomerDto;
  invoiceDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  subtotal: number;
  grandTotal: number;
  totalPaid: number;
  outstandingBalance: number;
  notes: string | null;
  items: InvoiceItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemDto {
  sourceJobId?: string;
  sourceJobItemRef?: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  invoiceDate?: string;
  dueDate?: string;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  items?: CreateInvoiceItemDto[];
  jobIds?: string[];
}

export interface UpdateInvoiceDto {
  dueDate?: string;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  status?: InvoiceStatus;
}

export interface InvoiceQueryParams extends PaginationParams {
  search?: string;
  customerId?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
  sortBy?: 'invoiceNo' | 'invoiceDate' | 'createdAt' | 'grandTotal' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInvoicesData {
  invoices: InvoiceDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceDetailData {
  invoice: InvoiceDto;
}
