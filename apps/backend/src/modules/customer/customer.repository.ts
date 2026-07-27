import type { Customer, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateCustomerDto, CustomerQueryFilter, UpdateCustomerDto } from './customer.types';

export class CustomerRepository {
  public async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByCode(code: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { customerCode: code, deletedAt: null },
    });
  }

  public async findByNameAndMobile(name: string, mobile: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        mobile,
        deletedAt: null,
      },
    });
  }

  public async countTotal(): Promise<number> {
    return prisma.customer.count();
  }

  public async create(data: CreateCustomerDto & { customerCode: string }): Promise<Customer> {
    return prisma.customer.create({
      data: {
        customerCode: data.customerCode,
        customerType: data.customerType ?? 'INDIVIDUAL',
        name: data.name,
        contactPerson: data.contactPerson || null,
        mobile: data.mobile || null,
        alternateMobile: data.alternateMobile || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
  }

  public async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: {
        ...(data.customerType && { customerType: data.customerType }),
        ...(data.name && { name: data.name }),
        ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson || null }),
        ...(data.mobile !== undefined && { mobile: data.mobile || null }),
        ...(data.alternateMobile !== undefined && {
          alternateMobile: data.alternateMobile || null,
        }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  public async archive(id: string): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  public async findMany(
    filter: CustomerQueryFilter,
  ): Promise<{ customers: Customer[]; total: number }> {
    const {
      search,
      customerType,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(customerType && { customerType }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { customerCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }
}

export const customerRepository = new CustomerRepository();
