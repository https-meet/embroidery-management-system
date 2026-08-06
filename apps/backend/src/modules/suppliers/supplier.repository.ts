import type { Prisma, Supplier, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type { CreateSupplierDto, SupplierQueryFilter, UpdateSupplierDto } from './supplier.types';

export class SupplierRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findById(id: string): Promise<Supplier | null> {
    try {
      return await this.prisma.supplier.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  public async findByName(name: string): Promise<Supplier | null> {
    try {
      return await this.prisma.supplier.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
        },
      });
    } catch {
      return null;
    }
  }

  public async create(data: CreateSupplierDto): Promise<Supplier> {
    return this.prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson ?? null,
        phone: data.phone ?? null,
        email: data.email || null,
        gstNumber: data.gstNumber || null,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? 'India',
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
      },
    });
  }

  public async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    const updateData: Prisma.SupplierUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber || null;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.supplier.update({
      where: { id },
      data: updateData,
    });
  }

  public async updateStatus(id: string, isActive: boolean): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive },
    });
  }

  public async findMany(filter: SupplierQueryFilter): Promise<{ suppliers: Supplier[]; total: number }> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {};

    if (filter.active !== undefined && filter.active !== '') {
      where.isActive = filter.active === 'true' || filter.active === true;
    }

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.SupplierOrderByWithRelationInput = {};
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'city') orderBy.city = sortOrder;
    else if (sortBy === 'state') orderBy.state = sortOrder;
    else orderBy.createdAt = sortOrder;

    try {
      const [suppliers, total] = await Promise.all([
        this.prisma.supplier.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.supplier.count({ where }),
      ]);

      return { suppliers, total };
    } catch {
      return { suppliers: [], total: 0 };
    }
  }
}

export const supplierRepository = new SupplierRepository();
