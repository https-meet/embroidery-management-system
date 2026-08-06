import type { Prisma, PrismaClient } from '@prisma/client';
import { AppError, BadRequestError } from '../../utils/errors';
import { CustomerRepository, customerRepository } from '../customer/customer.repository';
import { JobRepository, jobRepository } from '../job/job.repository';
import { DocumentSequenceService, documentSequenceService } from '../sequence/document-sequence.service';
import { DocumentType } from '../sequence/document-sequence.types';
import {
  invoiceCalculationService,
  type InvoiceCalculationService,
} from './invoice-calculation.service';
import { InvoiceRepository, invoiceRepository, type FullInvoice } from './invoice.repository';
import type {
  CreateInvoiceDto,
  CreateInvoiceItemDto,
  InvoiceQueryFilter,
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
  UpdateInvoiceDto,
} from './invoice.types';

export class InvoiceService {
  private readonly repo: InvoiceRepository;
  private readonly customerRepo: CustomerRepository;
  private readonly jobRepo: JobRepository;
  private readonly seqService: DocumentSequenceService;
  private readonly calculationService: InvoiceCalculationService;
  private readonly prismaClient?: PrismaClient;

  constructor(
    repoOrPrisma?: InvoiceRepository | PrismaClient,
    calculationService: InvoiceCalculationService = invoiceCalculationService,
  ) {
    this.calculationService = calculationService;
    if (repoOrPrisma && 'findById' in repoOrPrisma) {
      this.repo = repoOrPrisma;
      this.customerRepo = customerRepository;
      this.jobRepo = jobRepository;
      this.seqService = documentSequenceService;
    } else if (repoOrPrisma) {
      this.prismaClient = repoOrPrisma as PrismaClient;
      this.repo = new InvoiceRepository(this.prismaClient);
      this.customerRepo = new CustomerRepository(this.prismaClient);
      this.jobRepo = new JobRepository(this.prismaClient);
      this.seqService = new DocumentSequenceService(this.prismaClient);
    } else {
      this.repo = invoiceRepository;
      this.customerRepo = customerRepository;
      this.jobRepo = jobRepository;
      this.seqService = documentSequenceService;
    }
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
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestError('INVALID_CUSTOMER', 'Target customer does not exist.');
    }

    const itemsToCreate: CreateInvoiceItemDto[] = [];

    if (dto.jobIds && dto.jobIds.length > 0) {
      for (const jobId of dto.jobIds) {
        const job = await this.jobRepo.findById(jobId);
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

    const invoiceNo = await this.seqService.generateNextNumber(DocumentType.INV, {
      date: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
    });
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
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { invoices, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
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

    const itemsToProcess = dto.items && dto.items.length > 0
      ? dto.items
      : existing.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          rate: i.rate,
          sourceJobId: i.sourceJobId ?? undefined,
          sourceJobItemRef: i.sourceJobItemRef ?? undefined,
        }));

    const calcResult = this.calculationService.calculate({
      items: itemsToProcess.map((i) => ({ quantity: i.quantity, rate: i.rate })),
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

    const updatePayload: Prisma.InvoiceUpdateInput = {
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
      ...(dto.discountType !== undefined && { discountType: dto.discountType }),
      ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
      discountAmount: calcResult.discountAmount,
      subtotal: calcResult.subtotal,
      grandTotal: calcResult.grandTotal,
      outstandingBalance: calcResult.outstandingBalance,
      status: newStatus,
      ...(dto.notes !== undefined && { notes: dto.notes || null }),
    };

    if (dto.items && dto.items.length > 0) {
      updatePayload.items = {
        deleteMany: {},
        create: dto.items.map((item) => ({
          sourceJobId: item.sourceJobId ?? null,
          sourceJobItemRef: item.sourceJobItemRef ?? null,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: Math.round(item.quantity * item.rate * 100) / 100,
        })),
      };
    }

    const updated = await this.repo.update(id, updatePayload);

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
