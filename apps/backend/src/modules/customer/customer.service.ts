import type { Customer } from '@prisma/client';
import { AppError, ConflictError } from '../../utils/errors';
import { customerRepository, type CustomerRepository } from './customer.repository';
import type {
  CreateCustomerDto,
  CustomerQueryFilter,
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
  UpdateCustomerDto,
} from './customer.types';

export class CustomerService {
  constructor(private readonly repo: CustomerRepository = customerRepository) {}

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

  public async listCustomers(filter: CustomerQueryFilter): Promise<PaginatedCustomersResponseDto> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const { customers, total } = await this.repo.findMany(filter);
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
