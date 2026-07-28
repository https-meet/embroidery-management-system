import type { Customer, DiscountType, Invoice, InvoiceItem, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateInvoiceItemDto, InvoiceQueryFilter } from './invoice.types';

export type FullInvoice = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
};

export class InvoiceRepository {
  public async findById(id: string): Promise<FullInvoice | null> {
    return prisma.invoice.findFirst({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  public async findByInvoiceNo(invoiceNo: string): Promise<FullInvoice | null> {
    return prisma.invoice.findFirst({
      where: { invoiceNo },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  public async countTotalForYear(year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.invoice.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  public async create(data: {
    invoiceNo: string;
    customerId: string;
    invoiceDate?: Date;
    dueDate?: Date | null;
    discountType?: DiscountType | null;
    discountValue?: number | null;
    discountAmount: number;
    subtotal: number;
    grandTotal: number;
    totalPaid: number;
    outstandingBalance: number;
    notes?: string | null;
    items: CreateInvoiceItemDto[];
  }): Promise<FullInvoice> {
    return prisma.invoice.create({
      data: {
        invoiceNo: data.invoiceNo,
        customerId: data.customerId,
        invoiceDate: data.invoiceDate ?? new Date(),
        dueDate: data.dueDate ?? null,
        discountType: data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        discountAmount: data.discountAmount,
        subtotal: data.subtotal,
        grandTotal: data.grandTotal,
        totalPaid: data.totalPaid,
        outstandingBalance: data.outstandingBalance,
        notes: data.notes ?? null,
        items: {
          create: data.items.map((item) => ({
            sourceJobId: item.sourceJobId ?? null,
            sourceJobItemRef: item.sourceJobItemRef ?? null,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: Math.round(item.quantity * item.rate * 100) / 100,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  public async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<FullInvoice> {
    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  public async findMany(
    filter: InvoiceQueryFilter,
  ): Promise<{ invoices: FullInvoice[]; total: number }> {
    const search = filter.search;
    const customerId = filter.customerId;
    const status = filter.status;
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    const where: Prisma.InvoiceWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { invoiceNo: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          items: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }
}

export const invoiceRepository = new InvoiceRepository();
