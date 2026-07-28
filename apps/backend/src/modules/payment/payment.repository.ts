import type { Customer, Payment, PaymentAllocation, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreatePaymentAllocationDto, PaymentQueryFilter } from './payment.types';

export type FullPayment = Payment & {
  customer: Customer;
  allocations: PaymentAllocation[];
};

export class PaymentRepository {
  public async findById(id: string): Promise<FullPayment | null> {
    return prisma.payment.findFirst({
      where: { id },
      include: {
        customer: true,
        allocations: true,
      },
    });
  }

  public async findByPaymentNo(paymentNo: string): Promise<FullPayment | null> {
    return prisma.payment.findFirst({
      where: { paymentNo },
      include: {
        customer: true,
        allocations: true,
      },
    });
  }

  public async countTotalForYear(year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.payment.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  public async create(data: {
    paymentNo: string;
    customerId: string;
    paymentDate?: Date;
    paymentMethod: PaymentMethod;
    referenceNo?: string | null;
    amount: number;
    notes?: string | null;
    allocations: CreatePaymentAllocationDto[];
  }): Promise<FullPayment> {
    return prisma.payment.create({
      data: {
        paymentNo: data.paymentNo,
        customerId: data.customerId,
        paymentDate: data.paymentDate ?? new Date(),
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo ?? null,
        amount: data.amount,
        status: 'CONFIRMED',
        notes: data.notes ?? null,
        allocations: {
          create: data.allocations.map((alloc) => ({
            invoiceId: alloc.invoiceId,
            allocatedAmount: alloc.allocatedAmount,
          })),
        },
      },
      include: {
        customer: true,
        allocations: true,
      },
    });
  }

  public async findMany(
    filter: PaymentQueryFilter,
  ): Promise<{ payments: FullPayment[]; total: number }> {
    const search = filter.search;
    const customerId = filter.customerId;
    const status = filter.status;
    const paymentMethod = filter.paymentMethod;
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    const where: Prisma.PaymentWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(search && {
        OR: [
          { paymentNo: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { referenceNo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          allocations: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }
}

export const paymentRepository = new PaymentRepository();
