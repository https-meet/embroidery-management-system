import type { Prisma, Purchase } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { PurchaseQueryFilter } from './purchase.types';

export class PurchaseRepository {
  public async findById(id: string) {
    try {
      return await prisma.purchase.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: {
            include: {
              material: true,
            },
          },
        },
      });
    } catch {
      return null;
    }
  }

  public async findByPurchaseNumber(purchaseNumber: string): Promise<Purchase | null> {
    try {
      return await prisma.purchase.findUnique({
        where: { purchaseNumber },
      });
    } catch {
      return null;
    }
  }

  public async findMany(filter: PurchaseQueryFilter) {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = {};

    if (filter.supplierId) {
      where.supplierId = filter.supplierId;
    }

    if (filter.inventoryUpdated !== undefined && filter.inventoryUpdated !== '') {
      where.inventoryUpdated = filter.inventoryUpdated === 'true' || filter.inventoryUpdated === true;
    }

    if (filter.startDate || filter.endDate) {
      where.purchaseDate = {};
      if (filter.startDate) where.purchaseDate.gte = new Date(filter.startDate);
      if (filter.endDate) where.purchaseDate.lte = new Date(filter.endDate);
    }

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { purchaseNumber: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.PurchaseOrderByWithRelationInput = {};
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    if (sortBy === 'purchaseNumber') orderBy.purchaseNumber = sortOrder;
    else if (sortBy === 'purchaseDate') orderBy.purchaseDate = sortOrder;
    else if (sortBy === 'total') orderBy.total = sortOrder;
    else orderBy.createdAt = sortOrder;

    try {
      const [purchases, total] = await Promise.all([
        prisma.purchase.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            supplier: true,
            items: {
              include: {
                material: true,
              },
            },
          },
        }),
        prisma.purchase.count({ where }),
      ]);

      return { purchases, total };
    } catch {
      return { purchases: [], total: 0 };
    }
  }
}

export const purchaseRepository = new PurchaseRepository();
