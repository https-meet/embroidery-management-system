import type { DiscountType, InvoiceStatus } from '@prisma/client';
import type { CustomerResponseDto } from '../customer/customer.types';

export interface InvoiceItemResponseDto {
  id: string;
  invoiceId: string;
  sourceJobId: string | null;
  sourceJobItemRef: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceResponseDto {
  id: string;
  invoiceNo: string;
  customerId: string;
  customer?: CustomerResponseDto;
  invoiceDate: Date;
  dueDate: Date | null;
  status: InvoiceStatus;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  subtotal: number;
  grandTotal: number;
  totalPaid: number;
  outstandingBalance: number;
  notes: string | null;
  items: InvoiceItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
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
  jobIds?: string[]; // Generate from completed job(s)
}

export interface UpdateInvoiceDto {
  dueDate?: string;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  status?: InvoiceStatus;
}

export interface InvoiceQueryFilter {
  search?: string;
  customerId?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
  sortBy?: 'invoiceNo' | 'invoiceDate' | 'createdAt' | 'grandTotal' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInvoicesResponseDto {
  invoices: InvoiceResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
