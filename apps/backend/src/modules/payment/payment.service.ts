import { prisma } from '../../lib/prisma';
import { AppError, BadRequestError } from '../../utils/errors';
import { customerRepository } from '../customer/customer.repository';
import { invoiceCalculationService } from '../invoice/invoice-calculation.service';
import { invoiceRepository } from '../invoice/invoice.repository';
import { paymentRepository, type FullPayment, type PaymentRepository } from './payment.repository';
import type {
  CreatePaymentDto,
  PaginatedPaymentsResponseDto,
  PaymentQueryFilter,
  PaymentResponseDto,
} from './payment.types';

export class PaymentService {
  constructor(private readonly repo: PaymentRepository = paymentRepository) {}

  private async generatePaymentNo(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.repo.countTotalForYear(currentYear);
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(6, '0');
    return `PAY-${currentYear}-${padded}`;
  }

  private mapToDto(payment: FullPayment): PaymentResponseDto {
    const allocations = (payment.allocations || []).map((alloc) => ({
      id: alloc.id,
      paymentId: alloc.paymentId,
      invoiceId: alloc.invoiceId,
      allocatedAmount: alloc.allocatedAmount,
      createdAt: alloc.createdAt,
      updatedAt: alloc.updatedAt,
    }));

    return {
      id: payment.id,
      paymentNo: payment.paymentNo,
      customerId: payment.customerId,
      customer: payment.customer
        ? {
            id: payment.customer.id,
            customerCode: payment.customer.customerCode,
            customerType: payment.customer.customerType,
            name: payment.customer.name,
            contactPerson: payment.customer.contactPerson,
            mobile: payment.customer.mobile,
            alternateMobile: payment.customer.alternateMobile,
            email: payment.customer.email,
            address: payment.customer.address,
            notes: payment.customer.notes,
            isActive: payment.customer.isActive,
            createdAt: payment.customer.createdAt,
            updatedAt: payment.customer.updatedAt,
          }
        : undefined,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      referenceNo: payment.referenceNo,
      amount: payment.amount,
      status: payment.status,
      notes: payment.notes,
      allocations,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  public async recordPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestError('INVALID_CUSTOMER', 'Target customer does not exist.');
    }

    if (dto.amount <= 0) {
      throw new BadRequestError(
        'INVALID_PAYMENT_AMOUNT',
        'Payment amount must be greater than zero.',
      );
    }

    const allocations = dto.allocations || [];
    let totalAllocated = 0;

    for (const alloc of allocations) {
      const invoice = await invoiceRepository.findById(alloc.invoiceId);
      if (!invoice) {
        throw new BadRequestError('INVALID_INVOICE', `Invoice ${alloc.invoiceId} does not exist.`);
      }

      if (invoice.customerId !== dto.customerId) {
        throw new BadRequestError(
          'CUSTOMER_MISMATCH',
          `Invoice ${invoice.invoiceNo} belongs to a different customer.`,
        );
      }

      if (invoice.status === 'CANCELLED') {
        throw new BadRequestError(
          'CANCELLED_INVOICE',
          `Cannot allocate payment to cancelled invoice ${invoice.invoiceNo}.`,
        );
      }

      if (alloc.allocatedAmount > invoice.outstandingBalance) {
        throw new BadRequestError(
          'OVER_ALLOCATION',
          `Allocated amount ${alloc.allocatedAmount} exceeds invoice ${invoice.invoiceNo} remaining balance of ${invoice.outstandingBalance}.`,
        );
      }

      totalAllocated += alloc.allocatedAmount;
    }

    if (allocations.length > 0 && Math.abs(totalAllocated - dto.amount) > 0.01) {
      throw new BadRequestError(
        'ALLOCATION_MISMATCH',
        `Total allocated amount (${totalAllocated}) must equal payment amount (${dto.amount}).`,
      );
    }

    const paymentNo = await this.generatePaymentNo();

    // Execute payment record creation and invoice updates atomically in an interactive transaction
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await this.repo.create(
        {
          paymentNo,
          customerId: dto.customerId,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMethod: dto.paymentMethod,
          referenceNo: dto.referenceNo,
          amount: dto.amount,
          notes: dto.notes,
          allocations,
        },
        tx,
      );

      // Apply allocations to invoices within the same atomic transaction
      for (const alloc of allocations) {
        const invoice = await invoiceRepository.findById(alloc.invoiceId, tx);
        if (invoice) {
          const newTotalPaid = Math.round((invoice.totalPaid + alloc.allocatedAmount) * 100) / 100;
          const newOutstanding = Math.max(
            0,
            Math.round((invoice.grandTotal - newTotalPaid) * 100) / 100,
          );
          const newStatus = invoiceCalculationService.determineStatus(
            invoice.status,
            invoice.grandTotal,
            newTotalPaid,
          );

          await invoiceRepository.update(
            invoice.id,
            {
              totalPaid: newTotalPaid,
              outstandingBalance: newOutstanding,
              status: newStatus,
            },
            tx,
          );
        }
      }

      return createdPayment;
    });

    return this.mapToDto(payment);
  }

  public async getPaymentById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.repo.findById(id);
    if (!payment) {
      throw new AppError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    }
    return this.mapToDto(payment);
  }

  public async listPayments(filter: PaymentQueryFilter): Promise<PaginatedPaymentsResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { payments, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      payments: payments.map((p) => this.mapToDto(p)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export const paymentService = new PaymentService();
