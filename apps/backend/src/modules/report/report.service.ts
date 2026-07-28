import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type {
  CustomerReportItemDto,
  InvoiceReportItemDto,
  JobReportItemDto,
  PaymentReportItemDto,
  ProductionReportItemDto,
  ReportFilterDto,
  RevenueReportDto,
} from './report.types';

export class ReportService {
  private getDateRangeWhere(filter: ReportFilterDto): { gte?: Date; lte?: Date } | undefined {
    if (!filter.startDate && !filter.endDate) return undefined;
    return {
      ...(filter.startDate && { gte: new Date(filter.startDate) }),
      ...(filter.endDate && { lte: new Date(filter.endDate) }),
    };
  }

  public async getCustomerReport(filter: ReportFilterDto): Promise<{
    items: CustomerReportItemDto[];
    total: number;
  }> {
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { customerCode: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          jobs: { where: { deletedAt: null } },
          invoices: true,
          payments: { where: { status: 'CONFIRMED' } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const items: CustomerReportItemDto[] = customers.map((c) => {
      const totalJobs = c.jobs.length;
      const totalInvoiced = c.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
      const totalPaid = c.invoices.reduce((sum, inv) => sum + inv.totalPaid, 0);
      const outstandingBalance = c.invoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);

      return {
        customerId: c.id,
        customerCode: c.customerCode,
        name: c.name,
        customerType: c.customerType,
        totalJobs,
        totalInvoiced,
        totalPaid,
        outstandingBalance,
      };
    });

    return { items, total };
  }

  public async getJobReport(filter: ReportFilterDto): Promise<{
    items: JobReportItemDto[];
    total: number;
  }> {
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const dateRange = this.getDateRangeWhere(filter);

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      ...(dateRange && { createdAt: dateRange }),
      ...(filter.search && {
        OR: [
          { jobNo: { contains: filter.search, mode: 'insensitive' } },
          { customer: { name: { contains: filter.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    const items: JobReportItemDto[] = jobs.map((j) => ({
      jobId: j.id,
      jobNo: j.jobNo,
      customerName: j.customer.name,
      jobDate: j.jobDate,
      status: j.status,
      priority: j.priority,
      totalAmount: j.items.reduce((sum, item) => sum + item.lineTotal, 0),
    }));

    return { items, total };
  }

  public async getProductionReport(filter: ReportFilterDto): Promise<{
    items: ProductionReportItemDto[];
    total: number;
  }> {
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const dateRange = this.getDateRangeWhere(filter);

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      ...(dateRange && { createdAt: dateRange }),
      ...(filter.search && {
        OR: [
          { jobNo: { contains: filter.search, mode: 'insensitive' } },
          { assignedOperator: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    const items: ProductionReportItemDto[] = jobs.map((j) => ({
      jobId: j.id,
      jobNo: j.jobNo,
      customerName: j.customer.name,
      assignedOperator: j.assignedOperator,
      status: j.status,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      itemCount: j.items.length,
    }));

    return { items, total };
  }

  public async getInvoiceReport(filter: ReportFilterDto): Promise<{
    items: InvoiceReportItemDto[];
    total: number;
  }> {
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const dateRange = this.getDateRangeWhere(filter);

    const where: Prisma.InvoiceWhereInput = {
      ...(dateRange && { createdAt: dateRange }),
      ...(filter.search && {
        OR: [
          { invoiceNo: { contains: filter.search, mode: 'insensitive' } },
          { customer: { name: { contains: filter.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.invoice.count({ where }),
    ]);

    const items: InvoiceReportItemDto[] = invoices.map((inv) => ({
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customer.name,
      invoiceDate: inv.invoiceDate,
      status: inv.status,
      subtotal: inv.subtotal,
      discountAmount: inv.discountAmount,
      grandTotal: inv.grandTotal,
      outstandingBalance: inv.outstandingBalance,
    }));

    return { items, total };
  }

  public async getPaymentReport(filter: ReportFilterDto): Promise<{
    items: PaymentReportItemDto[];
    total: number;
  }> {
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const dateRange = this.getDateRangeWhere(filter);

    const where: Prisma.PaymentWhereInput = {
      ...(dateRange && { createdAt: dateRange }),
      ...(filter.search && {
        OR: [
          { paymentNo: { contains: filter.search, mode: 'insensitive' } },
          { customer: { name: { contains: filter.search, mode: 'insensitive' } } },
          { referenceNo: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.payment.count({ where }),
    ]);

    const items: PaymentReportItemDto[] = payments.map((p) => ({
      paymentId: p.id,
      paymentNo: p.paymentNo,
      customerName: p.customer.name,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      referenceNo: p.referenceNo,
      amount: p.amount,
    }));

    return { items, total };
  }

  public async getRevenueReport(filter: ReportFilterDto): Promise<RevenueReportDto> {
    const dateRange = this.getDateRangeWhere(filter);

    const [invoicesAgg, paymentsAgg, paymentsByMethod] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { grandTotal: true, outstandingBalance: true },
        where: {
          status: { in: ['ISSUED', 'PARTIALLY_PAID', 'PAID'] },
          ...(dateRange && { createdAt: dateRange }),
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'CONFIRMED',
          ...(dateRange && { createdAt: dateRange }),
        },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        _sum: { amount: true },
        where: {
          status: 'CONFIRMED',
          ...(dateRange && { createdAt: dateRange }),
        },
      }),
    ]);

    const totalInvoiced = invoicesAgg._sum.grandTotal ?? 0;
    const totalOutstanding = invoicesAgg._sum.outstandingBalance ?? 0;
    const totalCollected = paymentsAgg._sum.amount ?? 0;

    const byPaymentMethod = paymentsByMethod.map((item) => ({
      method: item.paymentMethod,
      total: item._sum.amount ?? 0,
    }));

    return {
      periodStart: filter.startDate ? new Date(filter.startDate) : null,
      periodEnd: filter.endDate ? new Date(filter.endDate) : null,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      byPaymentMethod,
    };
  }

  public async getFullSystemBackup(): Promise<{
    timestamp: string;
    customers: unknown[];
    jobs: unknown[];
    invoices: unknown[];
    payments: unknown[];
    designs: unknown[];
  }> {
    const [customers, jobs, invoices, payments, designs] = await Promise.all([
      prisma.customer.findMany({ where: { deletedAt: null } }),
      prisma.job.findMany({
        where: { deletedAt: null },
        include: { customer: true, items: true },
      }),
      prisma.invoice.findMany({ include: { customer: true, items: true } }),
      prisma.payment.findMany({ include: { customer: true } }),
      prisma.design.findMany({ where: { deletedAt: null } }),
    ]);

    return {
      timestamp: new Date().toISOString(),
      customers,
      jobs,
      invoices,
      payments,
      designs,
    };
  }
}

export const reportService = new ReportService();
