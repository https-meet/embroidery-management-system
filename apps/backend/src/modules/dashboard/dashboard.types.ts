export interface DashboardSummaryResponseDto {
  totalCustomers: number;
  activeJobs: number;
  pendingInvoices: number;
  outstandingBalance: number;
  jobsDueToday: number;
  delayedJobs: number;
  jobsAwaitingQc: number;
  totalRevenueThisMonth: number;
}

export interface RecommendedActionDto {
  id: string;
  type: 'DELAYED_JOB' | 'AWAITING_QC' | 'OVERDUE_PAYMENT';
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  urgency: 'HIGH' | 'MEDIUM' | 'INFO';
}

export interface RecentActivityItemDto {
  id: string;
  type: 'JOB' | 'PAYMENT' | 'INVOICE' | 'QUALITY_CHECK';
  title: string;
  description: string;
  timestamp: Date;
  linkUrl?: string;
}

export interface WorkQueueItemDto {
  id: string;
  jobNo: string;
  customerName: string;
  status: string;
  assignedOperator?: string | null;
  dueDate: Date | null;
  priority: string;
}

export interface PaymentFollowUpItemDto {
  id: string;
  invoiceNo: string;
  customerName: string;
  outstandingBalance: number;
  dueDate: Date | null;
}

export interface DashboardDataDto {
  summary: DashboardSummaryResponseDto;
  workQueue: WorkQueueItemDto[];
  paymentFollowUp: PaymentFollowUpItemDto[];
  recommendedActions: RecommendedActionDto[];
  recentActivity: RecentActivityItemDto[];
}
