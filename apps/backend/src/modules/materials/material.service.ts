import type { AccessTokenPayload } from '../auth/jwt.service';
import { settingsService } from '../settings/settings.service';
import { AppError, BadRequestError } from '../../utils/errors';
import { materialRepository, type MaterialRepository } from './material.repository';
import type {
  CreateMaterialDto,
  MaterialQueryFilter,
  MaterialResponseDto,
  PaginatedMaterialsResponseDto,
  UpdateMaterialDto,
  UpdateMaterialStatusDto,
} from './material.types';

export class MaterialService {
  constructor(private readonly repo: MaterialRepository = materialRepository) {}

  public mapToDto(material: {
    id: string;
    name: string;
    sku: string | null;
    brand: string | null;
    colorName: string | null;
    colorCode: string | null;
    category: any;
    unit: any;
    purchasePrice: any;
    sellingPrice: any;
    minimumStock: number;
    currentStock: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): MaterialResponseDto {
    return {
      id: material.id,
      name: material.name,
      sku: material.sku,
      brand: material.brand,
      colorName: material.colorName,
      colorCode: material.colorCode,
      category: material.category,
      unit: material.unit,
      purchasePrice: typeof material.purchasePrice === 'number' ? material.purchasePrice : Number(material.purchasePrice),
      sellingPrice: material.sellingPrice !== null && material.sellingPrice !== undefined
        ? (typeof material.sellingPrice === 'number' ? material.sellingPrice : Number(material.sellingPrice))
        : null,
      minimumStock: material.minimumStock,
      currentStock: material.currentStock,
      description: material.description,
      isActive: material.isActive,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    };
  }

  public async listMaterials(filter: MaterialQueryFilter): Promise<PaginatedMaterialsResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { materials, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      materials: materials.map((m) => this.mapToDto(m)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getMaterialById(id: string): Promise<MaterialResponseDto> {
    const material = await this.repo.findById(id);
    if (!material) {
      throw new AppError('MATERIAL_NOT_FOUND', 'Material record not found.', 404);
    }
    return this.mapToDto(material);
  }

  public async createMaterial(
    dto: CreateMaterialDto,
    adminUser: AccessTokenPayload,
  ): Promise<{ material: MaterialResponseDto; skuWarning?: string }> {
    const existingName = await this.repo.findByName(dto.name);
    if (existingName) {
      throw new BadRequestError(
        'MATERIAL_NAME_EXISTS',
        'A material with this name already exists.',
      );
    }

    let skuWarning: string | undefined;
    if (dto.sku) {
      const existingSku = await this.repo.findBySku(dto.sku);
      if (existingSku) {
        skuWarning = `Warning: SKU '${dto.sku}' is already assigned to another material ('${existingSku.name}').`;
      }
    }

    const created = await this.repo.create(dto);

    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'MATERIAL_CREATED',
      entityType: 'MATERIAL',
      entityId: created.id,
      newValue: JSON.stringify({ name: created.name, category: created.category, brand: created.brand, purchasePrice: Number(created.purchasePrice) }),
    });

    return {
      material: this.mapToDto(created),
      ...(skuWarning && { skuWarning }),
    };
  }

  public async updateMaterial(
    id: string,
    dto: UpdateMaterialDto,
    adminUser: AccessTokenPayload,
  ): Promise<{ material: MaterialResponseDto; skuWarning?: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('MATERIAL_NOT_FOUND', 'Material record not found.', 404);
    }

    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameConflict = await this.repo.findByName(dto.name);
      if (nameConflict) {
        throw new BadRequestError(
          'MATERIAL_NAME_EXISTS',
          'A material with this name already exists.',
        );
      }
    }

    let skuWarning: string | undefined;
    if (dto.sku && dto.sku !== existing.sku) {
      const skuConflict = await this.repo.findBySku(dto.sku);
      if (skuConflict && skuConflict.id !== id) {
        skuWarning = `Warning: SKU '${dto.sku}' is already assigned to another material ('${skuConflict.name}').`;
      }
    }

    const updated = await this.repo.update(id, dto);

    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'MATERIAL_UPDATED',
      entityType: 'MATERIAL',
      entityId: updated.id,
      previousValue: JSON.stringify({ name: existing.name, purchasePrice: Number(existing.purchasePrice), currentStock: existing.currentStock }),
      newValue: JSON.stringify({ name: updated.name, purchasePrice: Number(updated.purchasePrice), currentStock: updated.currentStock }),
    });

    return {
      material: this.mapToDto(updated),
      ...(skuWarning && { skuWarning }),
    };
  }

  public async updateMaterialStatus(
    id: string,
    dto: UpdateMaterialStatusDto,
    adminUser: AccessTokenPayload,
  ): Promise<MaterialResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('MATERIAL_NOT_FOUND', 'Material record not found.', 404);
    }

    const updated = await this.repo.updateStatus(id, dto.isActive);

    const action = dto.isActive ? 'MATERIAL_ACTIVATED' : 'MATERIAL_DEACTIVATED';
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action,
      entityType: 'MATERIAL',
      entityId: updated.id,
      previousValue: JSON.stringify({ isActive: existing.isActive }),
      newValue: JSON.stringify({ isActive: updated.isActive }),
    });

    return this.mapToDto(updated);
  }
}

export const materialService = new MaterialService();
