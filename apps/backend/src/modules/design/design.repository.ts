import type { Design, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateDesignDto, DesignQueryFilter, UpdateDesignDto } from './design.types';

export class DesignRepository {
  public async findById(id: string): Promise<Design | null> {
    return prisma.design.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByCode(code: string): Promise<Design | null> {
    return prisma.design.findFirst({
      where: { designCode: code, deletedAt: null },
    });
  }

  public async findByName(name: string): Promise<Design | null> {
    return prisma.design.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        deletedAt: null,
      },
    });
  }

  public async countTotalForYear(year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.design.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  public async create(data: CreateDesignDto & { designCode: string }): Promise<Design> {
    return prisma.design.create({
      data: {
        designCode: data.designCode,
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        previewUrl: data.previewUrl || null,
        primaryFileUrl: data.primaryFileUrl || null,
        primaryFileType: data.primaryFileType || null,
        stitchCount: data.stitchCount || null,
        widthMm: data.widthMm || null,
        heightMm: data.heightMm || null,
        colorCount: data.colorCount || null,
        notes: data.notes || null,
      },
    });
  }

  public async update(id: string, data: UpdateDesignDto): Promise<Design> {
    return prisma.design.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.category !== undefined && { category: data.category || null }),
        ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl || null }),
        ...(data.primaryFileUrl !== undefined && { primaryFileUrl: data.primaryFileUrl || null }),
        ...(data.primaryFileType !== undefined && {
          primaryFileType: data.primaryFileType || null,
        }),
        ...(data.stitchCount !== undefined && { stitchCount: data.stitchCount || null }),
        ...(data.widthMm !== undefined && { widthMm: data.widthMm || null }),
        ...(data.heightMm !== undefined && { heightMm: data.heightMm || null }),
        ...(data.colorCount !== undefined && { colorCount: data.colorCount || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  public async archive(id: string): Promise<Design> {
    return prisma.design.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  public async findMany(filter: DesignQueryFilter): Promise<{ designs: Design[]; total: number }> {
    const {
      search,
      category,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: Prisma.DesignWhereInput = {
      deletedAt: null,
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { designCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [designs, total] = await Promise.all([
      prisma.design.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.design.count({ where }),
    ]);

    return { designs, total };
  }
}

export const designRepository = new DesignRepository();
