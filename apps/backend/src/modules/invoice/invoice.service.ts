import { AppError, BadRequestError } from '../../utils/errors';
import { customerRepository } from '../customer/customer.repository';
import { jobRepository } from '../job/job.repository';
import {
  invoiceCalculationService,
  type InvoiceCalculationService,
} from './invoice-calculation.service';
import { invoiceRepository, type FullInvoice, type InvoiceRepository } from './invoice.repository';
import type {
  CreateInvoiceDto,
  CreateInvoiceItemDto,
  InvoiceQueryFilter,
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
  UpdateInvoiceDto,
} from './invoice.types';

export class InvoiceService {
  constructor(
    private readonly repo: InvoiceRepository = invoiceRepository,
    private readonly calculationService: InvoiceCalculationService = invoiceCalculationService,
  ) {}

  /**
   * Generates invoice number format INV-YYYY-NNNNNN (e.g. INV-2026-000145)
   */
  private async generateInvoiceNo(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.repo.countTotalForYear(currentYear);
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(6, '0');
    return `INV-${currentYear}-${padded}`;
  }

  private mapToDto(invoice: FullInvoice): InvoiceResponseDto {
    const items = (invoice.items || []).map((item) => ({
      id: item.id,
      invoiceId: item.invoiceId,
      sourceJobId: item.sourceJobId,
      sourceJobItemRef: item.sourceJobItemRef,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      customerId: invoice.customerId,
      customer: invoice.customer
        ? {
            id: invoice.customer.id,
            customerCode: invoice.customer.customerCode,
            customerType: invoice.customer.customerType,
            name: invoice.customer.name,
            contactPerson: invoice.customer.contactPerson,
            mobile: invoice.customer.mobile,
            alternateMobile: invoice.customer.alternateMobile,
            email: invoice.customer.email,
            address: invoice.customer.address,
            notes: invoice.customer.notes,
            isActive: invoice.customer.isActive,
            createdAt: invoice.customer.createdAt,
            updatedAt: invoice.customer.updatedAt,
          }
        : undefined,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      discountType: invoice.discountType,
      discountValue: invoice.discountValue,
      discountAmount: invoice.discountAmount,
      subtotal: invoice.subtotal,
      grandTotal: invoice.grandTotal,
      totalPaid: invoice.totalPaid,
      outstandingBalance: invoice.outstandingBalance,
      notes: invoice.notes,
      items,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  public async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestError('INVALID_CUSTOMER', 'Target customer does not exist.');
    }

    const itemsToCreate: CreateInvoiceItemDto[] = [];

    if (dto.jobIds && dto.jobIds.length > 0) {
      for (const jobId of dto.jobIds) {
        const job = await jobRepository.findById(jobId);
        if (!job) {
          throw new BadRequestError('INVALID_JOB', `Job ${jobId} does not exist.`);
        }
        if (job.customerId !== dto.customerId) {
          throw new BadRequestError(
            'CUSTOMER_MISMATCH',
            `Job ${job.jobNo} belongs to a different customer.`,
          );
        }

        for (const item of job.items) {
          itemsToCreate.push({
            sourceJobId: job.id,
            sourceJobItemRef: item.id,
            description: `Job ${job.jobNo} - ${item.position}`,
            quantity: item.quantity,
            rate: item.rate,
          });
        }
      }
    } else if (dto.items && dto.items.length > 0) {
      itemsToCreate.push(...dto.items);
    }

    if (itemsToCreate.length === 0) {
      throw new BadRequestError('EMPTY_INVOICE', 'Invoice must contain at least one line item.');
    }

    const calcResult = this.calculationService.calculate({
      items: itemsToCreate,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      totalPaid: 0,
    });

    if (calcResult.grandTotal <= 0) {
      throw new BadRequestError(
        'INVALID_GRAND_TOTAL',
        'Invoice grand total must be greater than zero.',
      );
    }

    const invoiceNo = await this.generateInvoiceNo();
    const invoice = await this.repo.create({
      invoiceNo,
      customerId: dto.customerId,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      discountAmount: calcResult.discountAmount,
      subtotal: calcResult.subtotal,
      grandTotal: calcResult.grandTotal,
      totalPaid: 0,
      outstandingBalance: calcResult.outstandingBalance,
      notes: dto.notes,
      items: itemsToCreate,
    });

    return this.mapToDto(invoice);
  }

  public async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.repo.findById(id);
    if (!invoice) {
      throw new AppError('INVOICE_NOT_FOUND', 'Invoice not found.', 404);
    }
    return this.mapToDto(invoice);
  }

  public async listInvoices(filter: InvoiceQueryFilter): Promise<PaginatedInvoicesResponseDto> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const { invoices, total } = await this.repo.findMany(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      invoices: invoices.map((inv) => this.mapToDto(inv)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('INVOICE_NOT_FOUND', 'Invoice not found.', 404);
    }

    if (existing.status !== 'DRAFT' && (dto.discountType || dto.discountValue)) {
      throw new BadRequestError(
        'INVOICE_LOCKED',
        'Issued invoices are locked and cannot have discounts modified.',
      );
    }

    const updatedItems = existing.items.map((i) => ({ quantity: i.quantity, rate: i.rate }));
    const calcResult = this.calculationService.calculate({
      items: updatedItems,
      discountType: dto.discountType ?? existing.discountType,
      discountValue: dto.discountValue ?? existing.discountValue,
      totalPaid: existing.totalPaid,
    });

    const newStatus = dto.status
      ? dto.status
      : this.calculationService.determineStatus(
          existing.status,
          calcResult.grandTotal,
          existing.totalPaid,
        );

    const updated = await this.repo.update(id, {
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
      ...(dto.discountType !== undefined && { discountType: dto.discountType }),
      ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
      discountAmount: calcResult.discountAmount,
      subtotal: calcResult.subtotal,
      grandTotal: calcResult.grandTotal,
      outstandingBalance: calcResult.outstandingBalance,
      status: newStatus,
      ...(dto.notes !== undefined && { notes: dto.notes || null }),
    });

    return this.mapToDto(updated);
  }

  public async cancelInvoice(id: string): Promise<InvoiceResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('INVOICE_NOT_FOUND', 'Invoice not found.', 404);
    }

    if (existing.status !== 'DRAFT') {
      throw new BadRequestError('INVALID_INVOICE_CANCEL', 'Only DRAFT invoices can be cancelled.');
    }

    const updated = await this.repo.update(id, { status: 'CANCELLED' });
    return this.mapToDto(updated);
  }
}

export const invoiceService = new InvoiceService();
