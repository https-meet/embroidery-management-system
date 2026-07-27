export interface ReportFilterDto {
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
  jobDate: Date;
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
  startedAt: Date | null;
  completedAt: Date | null;
  itemCount: number;
}

export interface InvoiceReportItemDto {
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  invoiceDate: Date;
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
  paymentDate: Date;
  paymentMethod: string;
  referenceNo: string | null;
  amount: number;
}

export interface RevenueReportDto {
  periodStart: Date | null;
  periodEnd: Date | null;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  byPaymentMethod: {
    method: string;
    total: number;
  }[];
}
