import { prisma } from '../../lib/prisma';
import type {
  DashboardDataDto,
  DashboardSummaryResponseDto,
  PaymentFollowUpItemDto,
  WorkQueueItemDto,
} from './dashboard.types';

export class DashboardService {
  public async getDashboardData(): Promise<DashboardDataDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalCustomers,
      activeJobsCount,
      pendingInvoicesCount,
      outstandingInvoices,
      jobsDueTodayCount,
      monthPayments,
      activeJobsList,
      pendingInvoicesList,
    ] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null, isActive: true } }),
      prisma.job.count({
        where: { deletedAt: null, status: { in: ['DRAFT', 'IN_PROGRESS'] } },
      }),
      prisma.invoice.count({
        where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } },
      }),
      prisma.invoice.aggregate({
        _sum: { outstandingBalance: true },
        where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } },
      }),
      prisma.job.count({
        where: {
          deletedAt: null,
          status: { in: ['DRAFT', 'IN_PROGRESS'] },
          expectedDeliveryDate: { lte: endOfDay },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.job.findMany({
        where: { deletedAt: null, status: { in: ['DRAFT', 'IN_PROGRESS'] } },
        take: 10,
        orderBy: [{ priority: 'desc' }, { expectedDeliveryDate: 'asc' }],
        include: { customer: true },
      }),
      prisma.invoice.findMany({
        where: { status: { in: ['ISSUED', 'PARTIALLY_PAID'] }, outstandingBalance: { gt: 0 } },
        take: 10,
        orderBy: { dueDate: 'asc' },
        include: { customer: true },
      }),
    ]);

    const summary: DashboardSummaryResponseDto = {
      totalCustomers,
      activeJobs: activeJobsCount,
      pendingInvoices: pendingInvoicesCount,
      outstandingBalance: outstandingInvoices._sum.outstandingBalance ?? 0,
      jobsDueToday: jobsDueTodayCount,
      totalRevenueThisMonth: monthPayments._sum.amount ?? 0,
    };

    const workQueue: WorkQueueItemDto[] = activeJobsList.map((job) => ({
      id: job.id,
      jobNo: job.jobNo,
      customerName: job.customer.name,
      status: job.status,
      dueDate: job.expectedDeliveryDate,
      priority: job.priority,
    }));

    const paymentFollowUp: PaymentFollowUpItemDto[] = pendingInvoicesList.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customer.name,
      outstandingBalance: inv.outstandingBalance,
      dueDate: inv.dueDate,
    }));

    return {
      summary,
      workQueue,
      paymentFollowUp,
    };
  }
}

export const dashboardService = new DashboardService();
