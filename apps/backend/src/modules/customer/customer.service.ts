import type { Customer, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import { AppError, ConflictError } from '../../utils/errors';
import { CustomerRepository, customerRepository } from './customer.repository';
import type {
  CreateCustomerDto,
  CustomerQueryFilter,
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
  UpdateCustomerDto,
} from './customer.types';

export class CustomerService {
  private readonly repo: CustomerRepository;
  private readonly prismaClient?: PrismaClient;

  constructor(repoOrPrisma?: CustomerRepository | PrismaClient) {
    if (repoOrPrisma && 'findById' in repoOrPrisma) {
      this.repo = repoOrPrisma;
    } else if (repoOrPrisma) {
      this.prismaClient = repoOrPrisma as PrismaClient;
      this.repo = new CustomerRepository(this.prismaClient);
    } else {
      this.repo = customerRepository;
    }
  }

  /**
   * Generates a sequential customer code, e.g. CUS-000001
   */
  private async generateCustomerCode(): Promise<string> {
    const count = await this.repo.countTotal();
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(6, '0');
    return `CUS-${padded}`;
  }

  private mapToDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      customerCode: customer.customerCode,
      customerType: customer.customerType,
      name: customer.name,
      contactPerson: customer.contactPerson,
      mobile: customer.mobile,
      alternateMobile: customer.alternateMobile,
      email: customer.email,
      address: customer.address,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  public async createCustomer(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    if (dto.mobile && dto.mobile.trim() !== '') {
      const duplicate = await this.repo.findByNameAndMobile(dto.name, dto.mobile);
      if (duplicate) {
        throw new ConflictError(
          'DUPLICATE_CUSTOMER',
          'A customer with the same name and mobile number already exists.',
        );
      }
    }

    const customerCode = await this.generateCustomerCode();
    const customer = await this.repo.create({ ...dto, customerCode });

    return this.mapToDto(customer);
  }

  public async getCustomerById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new AppError('CUSTOMER_NOT_FOUND', 'Customer not found.', 404);
    }
    return this.mapToDto(customer);
  }

  public async getCustomer360Data(id: string) {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new AppError('CUSTOMER_NOT_FOUND', 'Customer not found.', 404);
    }

    const client = this.prismaClient || defaultPrisma;

    const [
      jobs,
      invoices,
      payments,
      outstandingAggregate,
      revenueAggregate,
    ] = await Promise.all([
      client.job.findMany({
        where: { customerId: id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { items: true },
      }),
      client.invoice.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      client.payment.findMany({
        where: { customerId: id, status: { in: ['RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      client.invoice.aggregate({
        _sum: { outstandingBalance: true },
        where: { customerId: id, status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } },
      }),
      client.payment.aggregate({
        _sum: { amount: true },
        where: { customerId: id, status: { in: ['RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED'] } },
      }),
    ]);

    const activeJobs = jobs.filter((j) => ['DRAFT', 'IN_PROGRESS'].includes(j.status)).length;
    const lastOrderDate = jobs.length > 0 ? jobs[0]?.jobDate : null;
    const lifetimeRevenue = revenueAggregate._sum.amount ?? 0;
    const outstandingBalance = outstandingAggregate._sum.outstandingBalance ?? 0;

    const timeline = [
      ...jobs.map((j) => ({
        id: `job-${j.id}`,
        type: 'JOB',
        title: `Job #${j.jobNo} (${j.status})`,
        description: `Logged with ${j.items.length} line item(s) • Priority: ${j.priority}`,
        timestamp: j.createdAt,
      })),
      ...invoices.map((inv) => ({
        id: `inv-${inv.id}`,
        type: 'INVOICE',
        title: `Invoice #${inv.invoiceNo} Issued`,
        description: `Grand Total: ₹${inv.grandTotal.toLocaleString('en-IN')} (Status: ${inv.status})`,
        timestamp: inv.createdAt,
      })),
      ...payments.map((p) => ({
        id: `pay-${p.id}`,
        type: 'PAYMENT',
        title: `Payment Received (₹${p.amount.toLocaleString('en-IN')})`,
        description: `Method: ${p.paymentMethod} • Ref: ${p.referenceNo || 'N/A'}`,
        timestamp: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      customer: this.mapToDto(customer),
      summary: {
        lifetimeRevenue,
        outstandingBalance,
        totalJobs: jobs.length,
        activeJobs,
        lastOrderDate,
      },
      jobs,
      invoices,
      payments,
      timeline,
    };
  }

  public async listCustomers(filter: CustomerQueryFilter): Promise<PaginatedCustomersResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { customers, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      customers: customers.map((c) => this.mapToDto(c)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('CUSTOMER_NOT_FOUND', 'Customer not found.', 404);
    }

    const updated = await this.repo.update(id, dto);
    return this.mapToDto(updated);
  }

  public async archiveCustomer(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('CUSTOMER_NOT_FOUND', 'Customer not found.', 404);
    }

    await this.repo.archive(id);
  }
}

export const customerService = new CustomerService();
