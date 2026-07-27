import type { PaginationParams } from '@/shared/types/api.types';

export interface ReportFilterParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomerReportItemDto {
  customerId: string;
  customerCode: string;
  name: string;
  customerType: string;
  totalJobs: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
}

export interface JobReportItemDto {
  jobId: string;
  jobNo: string;
  customerName: string;
  jobDate: string;
  status: string;
  priority: string;
  totalAmount: number;
}

export interface ProductionReportItemDto {
  jobId: string;
  jobNo: string;
  customerName: string;
  assignedOperator: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  itemCount: number;
}

export interface InvoiceReportItemDto {
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  invoiceDate: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  outstandingBalance: number;
}

export interface PaymentReportItemDto {
  paymentId: string;
  paymentNo: string;
  customerName: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNo: string | null;
  amount: number;
}

export interface RevenueReportDto {
  periodStart: string | null;
  periodEnd: string | null;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  byPaymentMethod: {
    method: string;
    total: number;
  }[];
}

export interface PaginatedReportData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
