export interface DashboardSummaryResponseDto {
  totalCustomers: number;
  activeJobs: number;
  pendingInvoices: number;
  outstandingBalance: number;
  jobsDueToday: number;
  totalRevenueThisMonth: number;
}

export interface WorkQueueItemDto {
  id: string;
  jobNo: string;
  customerName: string;
  status: string;
  dueDate: string | null;
  priority: string;
}

export interface PaymentFollowUpItemDto {
  id: string;
  invoiceNo: string;
  customerName: string;
  outstandingBalance: number;
  dueDate: string | null;
}

export interface DashboardDataDto {
  summary: DashboardSummaryResponseDto;
  workQueue: WorkQueueItemDto[];
  paymentFollowUp: PaymentFollowUpItemDto[];
}
