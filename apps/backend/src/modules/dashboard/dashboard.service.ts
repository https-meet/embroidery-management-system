import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type {
  DashboardDataDto,
  DashboardSummaryResponseDto,
  PaymentFollowUpItemDto,
  RecentActivityItemDto,
  RecommendedActionDto,
  WorkQueueItemDto,
} from './dashboard.types';

export class DashboardService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async getDashboardData(): Promise<DashboardDataDto> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      activeJobsCount,
      pendingInvoicesCount,
      outstandingInvoices,
      jobsDueTodayCount,
      delayedJobsCount,
      jobsAwaitingQcCount,
      monthPayments,
      activeJobsList,
      pendingInvoicesList,
      recentJobs,
      recentPayments,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.job.count({
        where: { deletedAt: null, status: { in: ['DRAFT', 'IN_PROGRESS'] } },
      }),
      this.prisma.invoice.count({
        where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } },
      }),
      this.prisma.invoice.aggregate({
        _sum: { outstandingBalance: true },
        where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } },
      }),
      this.prisma.job.count({
        where: {
          deletedAt: null,
          status: { in: ['DRAFT', 'IN_PROGRESS'] },
          expectedDeliveryDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.job.count({
        where: {
          deletedAt: null,
          status: { in: ['DRAFT', 'IN_PROGRESS'] },
          expectedDeliveryDate: { lt: startOfDay },
        },
      }),
      this.prisma.job.count({
        where: {
          deletedAt: null,
          status: 'COMPLETED',
          qualityCheckedAt: null,
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ['RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED'] },
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.job.findMany({
        where: { deletedAt: null, status: { in: ['DRAFT', 'IN_PROGRESS'] } },
        take: 10,
        orderBy: [{ priority: 'desc' }, { expectedDeliveryDate: 'asc' }],
        include: { customer: true },
      }),
      this.prisma.invoice.findMany({
        where: { status: { in: ['ISSUED', 'PARTIALLY_PAID'] }, outstandingBalance: { gt: 0 } },
        take: 10,
        orderBy: { dueDate: 'asc' },
        include: { customer: true },
      }),
      this.prisma.job.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.payment.findMany({
        where: { status: { in: ['RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED'] } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
    ]);

    const summary: DashboardSummaryResponseDto = {
      totalCustomers,
      activeJobs: activeJobsCount,
      pendingInvoices: pendingInvoicesCount,
      outstandingBalance: outstandingInvoices._sum.outstandingBalance ?? 0,
      jobsDueToday: jobsDueTodayCount,
      delayedJobs: delayedJobsCount,
      jobsAwaitingQc: jobsAwaitingQcCount,
      totalRevenueThisMonth: monthPayments._sum.amount ?? 0,
    };

    const workQueue: WorkQueueItemDto[] = activeJobsList.map((job) => ({
      id: job.id,
      jobNo: job.jobNo,
      customerName: job.customer?.name ?? 'Unknown Customer',
      status: job.status,
      assignedOperator: job.assignedOperator,
      dueDate: job.expectedDeliveryDate,
      priority: job.priority,
    }));

    const paymentFollowUp: PaymentFollowUpItemDto[] = pendingInvoicesList.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customer?.name ?? 'Unknown Customer',
      outstandingBalance: inv.outstandingBalance,
      dueDate: inv.dueDate,
    }));

    const recommendedActions: RecommendedActionDto[] = [];
    if (delayedJobsCount > 0) {
      recommendedActions.push({
        id: 'action-delayed-jobs',
        type: 'DELAYED_JOB',
        title: 'Delayed Jobs Priority',
        description: `${delayedJobsCount} order(s) are past their target delivery date. Inspect production queue immediately.`,
        actionUrl: '/production?status=IN_PROGRESS',
        actionLabel: 'View Delayed Orders',
        urgency: 'HIGH',
      });
    }

    if (jobsAwaitingQcCount > 0) {
      recommendedActions.push({
        id: 'action-qc-pending',
        type: 'AWAITING_QC',
        title: 'Quality Check Required',
        description: `${jobsAwaitingQcCount} completed order(s) require stitch quality verification before billing.`,
        actionUrl: '/production?status=COMPLETED',
        actionLabel: 'Perform Quality Check',
        urgency: 'MEDIUM',
      });
    }

    if (pendingInvoicesList.length > 0) {
      recommendedActions.push({
        id: 'action-overdue-payments',
        type: 'OVERDUE_PAYMENT',
        title: 'Pending Customer Collections',
        description: `₹${(outstandingInvoices._sum.outstandingBalance ?? 0).toLocaleString('en-IN')} pending collection across ${pendingInvoicesCount} invoice(s).`,
        actionUrl: '/payments/new',
        actionLabel: 'Record Payment',
        urgency: 'MEDIUM',
      });
    }

    // Build unified Recent Activity Timeline
    const rawActivityList: RecentActivityItemDto[] = [
      ...recentJobs.map((j) => ({
        id: `job-${j.id}`,
        type: 'JOB' as const,
        title: `Job ${j.jobNo} Created`,
        description: `Order logged for ${j.customer?.name || 'Customer'} (${j.priority} Priority)`,
        timestamp: j.createdAt,
        linkUrl: `/jobs/${j.id}`,
      })),
      ...recentPayments.map((p) => ({
        id: `pay-${p.id}`,
        type: 'PAYMENT' as const,
        title: `Payment of ₹${p.amount.toLocaleString('en-IN')} Received`,
        description: `Collected via ${p.paymentMethod} from ${p.customer?.name || 'Customer'}`,
        timestamp: p.createdAt,
        linkUrl: `/payments`,
      })),
      ...recentInvoices.map((inv) => ({
        id: `inv-${inv.id}`,
        type: 'INVOICE' as const,
        title: `Invoice ${inv.invoiceNo} Generated`,
        description: `Issued for ${inv.customer?.name || 'Customer'} (Amount: ₹${inv.grandTotal.toLocaleString('en-IN')})`,
        timestamp: inv.createdAt,
        linkUrl: `/invoices/${inv.id}`,
      })),
    ];

    const recentActivity = rawActivityList
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    return {
      summary,
      workQueue,
      paymentFollowUp,
      recommendedActions,
      recentActivity,
    };
  }
}

export const dashboardService = new DashboardService();
