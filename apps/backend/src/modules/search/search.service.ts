import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';

export interface SearchResultItemDto {
  id: string;
  category: 'CUSTOMER' | 'JOB' | 'INVOICE' | 'PAYMENT' | 'DESIGN';
  title: string;
  subtitle: string;
  url: string;
}

export interface GroupedSearchResultsDto {
  query: string;
  results: {
    customers: SearchResultItemDto[];
    jobs: SearchResultItemDto[];
    invoices: SearchResultItemDto[];
    payments: SearchResultItemDto[];
    designs: SearchResultItemDto[];
  };
  totalCount: number;
}

export class SearchService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async searchAll(queryStr: string): Promise<GroupedSearchResultsDto> {
    const q = queryStr.trim();
    if (!q || q.length < 1) {
      return {
        query: q,
        results: { customers: [], jobs: [], invoices: [], payments: [], designs: [] },
        totalCount: 0,
      };
    }

    const [customers, jobs, invoices, payments, designs] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { customerCode: { contains: q, mode: 'insensitive' } },
            { mobile: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),
      this.prisma.job.findMany({
        where: {
          deletedAt: null,
          OR: [
            { jobNo: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNo: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.payment.findMany({
        where: {
          OR: [
            { paymentNo: { contains: q, mode: 'insensitive' } },
            { referenceNo: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.design.findMany({
        where: {
          deletedAt: null,
          OR: [
            { designCode: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedCustomers: SearchResultItemDto[] = customers.map((c) => ({
      id: c.id,
      category: 'CUSTOMER',
      title: c.name,
      subtitle: `${c.customerCode}${c.mobile ? ` • Mobile: ${c.mobile}` : ''}`,
      url: `/customers/${c.id}`,
    }));

    const mappedJobs: SearchResultItemDto[] = jobs.map((j) => ({
      id: j.id,
      category: 'JOB',
      title: `Job ${j.jobNo}`,
      subtitle: `Customer: ${j.customer.name} • Priority: ${j.priority}`,
      url: `/jobs/${j.id}`,
    }));

    const mappedInvoices: SearchResultItemDto[] = invoices.map((i) => ({
      id: i.id,
      category: 'INVOICE',
      title: `Invoice ${i.invoiceNo}`,
      subtitle: `Customer: ${i.customer.name} • Total: ₹${i.grandTotal.toLocaleString('en-IN')}`,
      url: `/invoices/${i.id}`,
    }));

    const mappedPayments: SearchResultItemDto[] = payments.map((p) => ({
      id: p.id,
      category: 'PAYMENT',
      title: `Payment ${p.paymentNo}`,
      subtitle: `Customer: ${p.customer.name} • ₹${p.amount.toLocaleString('en-IN')} (${p.paymentMethod})`,
      url: `/payments`,
    }));

    const mappedDesigns: SearchResultItemDto[] = designs.map((d) => ({
      id: d.id,
      category: 'DESIGN',
      title: d.name,
      subtitle: `Code: ${d.designCode}${d.category ? ` • Category: ${d.category}` : ''}`,
      url: `/designs/${d.id}`,
    }));

    const totalCount =
      mappedCustomers.length +
      mappedJobs.length +
      mappedInvoices.length +
      mappedPayments.length +
      mappedDesigns.length;

    return {
      query: q,
      results: {
        customers: mappedCustomers,
        jobs: mappedJobs,
        invoices: mappedInvoices,
        payments: mappedPayments,
        designs: mappedDesigns,
      },
      totalCount,
    };
  }
}

export const searchService = new SearchService();
