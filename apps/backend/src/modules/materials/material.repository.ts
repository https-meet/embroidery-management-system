import type { Material, Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type { CreateMaterialDto, MaterialQueryFilter, UpdateMaterialDto } from './material.types';

export class MaterialRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findById(id: string): Promise<Material | null> {
    try {
      return await this.prisma.material.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  public async findByName(name: string): Promise<Material | null> {
    try {
      return await this.prisma.material.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
        },
      });
    } catch {
      return null;
    }
  }

  public async findBySku(sku: string): Promise<Material | null> {
    try {
      return await this.prisma.material.findFirst({
        where: {
          sku: { equals: sku, mode: 'insensitive' },
        },
      });
    } catch {
      return null;
    }
  }

  public async create(data: CreateMaterialDto): Promise<Material> {
    return this.prisma.material.create({
      data: {
        name: data.name,
        sku: data.sku ?? null,
        brand: data.brand ?? null,
        colorName: data.colorName ?? null,
        colorCode: data.colorCode ?? null,
        category: data.category,
        unit: data.unit,
        purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : 0,
        sellingPrice: data.sellingPrice ?? null,
        minimumStock: data.minimumStock ?? 0,
        currentStock: data.currentStock ?? 0,
        description: data.description ?? null,
      },
    });
  }

  public async update(id: string, data: UpdateMaterialDto): Promise<Material> {
    const updateData: Prisma.MaterialUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.colorName !== undefined) updateData.colorName = data.colorName;
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
    if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice;
    if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock;
    if (data.currentStock !== undefined) updateData.currentStock = data.currentStock;
    if (data.description !== undefined) updateData.description = data.description;

    return this.prisma.material.update({
      where: { id },
      data: updateData,
    });
  }

  public async updateStatus(id: string, isActive: boolean): Promise<Material> {
    return this.prisma.material.update({
      where: { id },
      data: { isActive },
    });
  }

  public async findMany(filter: MaterialQueryFilter): Promise<{ materials: Material[]; total: number }> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialWhereInput = {};

    if (filter.active !== undefined && filter.active !== '') {
      where.isActive = filter.active === 'true' || filter.active === true;
    }

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.brand) {
      where.brand = { contains: filter.brand, mode: 'insensitive' };
    }

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { colorName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.MaterialOrderByWithRelationInput = {};
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'brand') orderBy.brand = sortOrder;
    else if (sortBy === 'currentStock') orderBy.currentStock = sortOrder;
    else orderBy.createdAt = sortOrder;

    try {
      const [materials, total] = await Promise.all([
        this.prisma.material.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.material.count({ where }),
      ]);

      return { materials, total };
    } catch {
      return { materials: [], total: 0 };
    }
  }
}

export const materialRepository = new MaterialRepository();
