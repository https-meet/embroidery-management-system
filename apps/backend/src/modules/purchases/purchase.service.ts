import type { AccessTokenPayload } from '../auth/jwt.service';
import { prisma } from '../../lib/prisma';
import { documentSequenceService } from '../sequence/document-sequence.service';
import { DocumentType } from '../sequence/document-sequence.types';
import { settingsService } from '../settings/settings.service';
import { AppError, BadRequestError } from '../../utils/errors';
import { materialRepository } from '../materials/material.repository';
import { supplierRepository } from '../suppliers/supplier.repository';
import { purchaseRepository, type PurchaseRepository } from './purchase.repository';
import type {
  CreatePurchaseDto,
  PaginatedPurchasesResponseDto,
  PurchaseQueryFilter,
  PurchaseResponseDto,
  UpdatePurchaseDto,
} from './purchase.types';

export class PurchaseService {
  constructor(private readonly repo: PurchaseRepository = purchaseRepository) {}

  public mapToDto(purchase: any): PurchaseResponseDto {
    return {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier?.name,
      purchaseDate: purchase.purchaseDate,
      invoiceNumber: purchase.invoiceNumber,
      invoiceDate: purchase.invoiceDate,
      subtotal: typeof purchase.subtotal === 'number' ? purchase.subtotal : Number(purchase.subtotal),
      discount: typeof purchase.discount === 'number' ? purchase.discount : Number(purchase.discount),
      tax: typeof purchase.tax === 'number' ? purchase.tax : Number(purchase.tax),
      total: typeof purchase.total === 'number' ? purchase.total : Number(purchase.total),
      notes: purchase.notes,
      inventoryUpdated: purchase.inventoryUpdated,
      createdBy: purchase.createdBy,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      items: (purchase.items || []).map((item: any) => ({
        id: item.id,
        purchaseId: item.purchaseId,
        materialId: item.materialId,
        materialName: item.material?.name,
        quantity: item.quantity,
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice),
        lineTotal: typeof item.lineTotal === 'number' ? item.lineTotal : Number(item.lineTotal),
      })),
    };
  }

  public async listPurchases(filter: PurchaseQueryFilter): Promise<PaginatedPurchasesResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { purchases, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      purchases: purchases.map((p) => this.mapToDto(p)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getPurchaseById(id: string): Promise<PurchaseResponseDto> {
    const purchase = await this.repo.findById(id);
    if (!purchase) {
      throw new AppError('PURCHASE_NOT_FOUND', 'Purchase record not found.', 404);
    }
    return this.mapToDto(purchase);
  }

  public async createPurchase(
    dto: CreatePurchaseDto,
    adminUser: AccessTokenPayload,
  ): Promise<PurchaseResponseDto> {
    const supplier = await supplierRepository.findById(dto.supplierId);
    if (!supplier) {
      throw new BadRequestError('SUPPLIER_NOT_FOUND', 'Target supplier does not exist.');
    }
    if (!supplier.isActive) {
      throw new BadRequestError('SUPPLIER_INACTIVE', 'Target supplier is deactivated.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError('EMPTY_PURCHASE_ITEMS', 'Purchase must contain at least one item.');
    }

    // Verify materials exist
    for (const item of dto.items) {
      const mat = await materialRepository.findById(item.materialId);
      if (!mat) {
        throw new BadRequestError('MATERIAL_NOT_FOUND', `Material ID '${item.materialId}' does not exist.`);
      }
    }

    // Financial calculation
    let subtotal = 0;
    const itemCalculations = dto.items.map((item) => {
      const lineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
      subtotal += lineTotal;
      return {
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    const discount = dto.discount ? Number(dto.discount.toFixed(2)) : 0;
    const tax = dto.tax ? Number(dto.tax.toFixed(2)) : 0;
    const total = Number((subtotal - discount + tax).toFixed(2));

    if (total < 0) {
      throw new BadRequestError('INVALID_FINANCIAL_TOTALS', 'Purchase total cannot be negative.');
    }

    const shouldUpdateInventory = Boolean(dto.updateInventory);

    // Execute in a single Prisma transaction
    const createdPurchase = await prisma.$transaction(async (tx) => {
      // 1. Generate sequence PUR-YYYY-XXXXXX
      const purchaseNumber = await documentSequenceService.generateNextNumber(DocumentType.PUR, { tx });

      // 2. Create Purchase record
      const p = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId: dto.supplierId,
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
          invoiceNumber: dto.invoiceNumber || null,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
          subtotal,
          discount,
          tax,
          total,
          notes: dto.notes || null,
          inventoryUpdated: shouldUpdateInventory,
          createdBy: adminUser.email,
          items: {
            create: itemCalculations.map((item) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              material: true,
            },
          },
        },
      });

      // 3. Increment stock if updateInventory is true
      if (shouldUpdateInventory) {
        for (const item of itemCalculations) {
          await tx.material.update({
            where: { id: item.materialId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return p;
    });

    // 4. Audit Log entries
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'PURCHASE_CREATED',
      entityType: 'PURCHASE',
      entityId: createdPurchase.id,
      newValue: JSON.stringify({
        purchaseNumber: createdPurchase.purchaseNumber,
        supplierId: createdPurchase.supplierId,
        total: Number(createdPurchase.total),
        inventoryUpdated: createdPurchase.inventoryUpdated,
      }),
    });

    if (shouldUpdateInventory) {
      await settingsService.logAuditAction({
        userId: adminUser.userId,
        userName: adminUser.email,
        action: 'INVENTORY_UPDATED_FROM_PURCHASE',
        entityType: 'PURCHASE',
        entityId: createdPurchase.id,
        newValue: JSON.stringify({
          purchaseNumber: createdPurchase.purchaseNumber,
          itemsUpdated: itemCalculations.length,
        }),
      });
    }

    return this.mapToDto(createdPurchase);
  }

  public async updatePurchase(
    id: string,
    dto: UpdatePurchaseDto,
    adminUser: AccessTokenPayload,
  ): Promise<PurchaseResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('PURCHASE_NOT_FOUND', 'Purchase record not found.', 404);
    }

    if (dto.supplierId && dto.supplierId !== existing.supplierId) {
      const supplier = await supplierRepository.findById(dto.supplierId);
      if (!supplier) {
        throw new BadRequestError('SUPPLIER_NOT_FOUND', 'Target supplier does not exist.');
      }
    }

    let itemCalculations = (existing.items || []).map((i: any) => ({
      materialId: i.materialId,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    }));

    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        const mat = await materialRepository.findById(item.materialId);
        if (!mat) {
          throw new BadRequestError('MATERIAL_NOT_FOUND', `Material ID '${item.materialId}' does not exist.`);
        }
      }

      itemCalculations = dto.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: Number((item.quantity * item.unitPrice).toFixed(2)),
      }));
    }

    let subtotal = itemCalculations.reduce((sum, i) => sum + i.lineTotal, 0);
    subtotal = Number(subtotal.toFixed(2));
    const discount = dto.discount !== undefined ? Number(dto.discount.toFixed(2)) : Number(existing.discount);
    const tax = dto.tax !== undefined ? Number(dto.tax.toFixed(2)) : Number(existing.tax);
    const total = Number((subtotal - discount + tax).toFixed(2));

    if (total < 0) {
      throw new BadRequestError('INVALID_FINANCIAL_TOTALS', 'Purchase total cannot be negative.');
    }

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      if (dto.items && dto.items.length > 0) {
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: id },
        });
      }

      const p = await tx.purchase.update({
        where: { id },
        data: {
          supplierId: dto.supplierId || existing.supplierId,
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : existing.purchaseDate,
          invoiceNumber: dto.invoiceNumber !== undefined ? dto.invoiceNumber : existing.invoiceNumber,
          invoiceDate: dto.invoiceDate !== undefined ? (dto.invoiceDate ? new Date(dto.invoiceDate) : null) : existing.invoiceDate,
          subtotal,
          discount,
          tax,
          total,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          ...(dto.items && dto.items.length > 0
            ? {
                items: {
                  create: itemCalculations.map((item) => ({
                    materialId: item.materialId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                  })),
                },
              }
            : {}),
        },
        include: {
          supplier: true,
          items: {
            include: {
              material: true,
            },
          },
        },
      });

      return p;
    });

    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'PURCHASE_UPDATED',
      entityType: 'PURCHASE',
      entityId: updatedPurchase.id,
      previousValue: JSON.stringify({ total: Number(existing.total) }),
      newValue: JSON.stringify({ total: Number(updatedPurchase.total) }),
    });

    return this.mapToDto(updatedPurchase);
  }
}

export const purchaseService = new PurchaseService();
