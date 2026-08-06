import type { PrismaClient, Supplier } from '@prisma/client';
import type { AccessTokenPayload } from '../auth/jwt.service';
import { settingsService } from '../settings/settings.service';
import { AppError, BadRequestError } from '../../utils/errors';
import { SupplierRepository, supplierRepository } from './supplier.repository';
import type {
  CreateSupplierDto,
  PaginatedSuppliersResponseDto,
  SupplierQueryFilter,
  SupplierResponseDto,
  UpdateSupplierDto,
  UpdateSupplierStatusDto,
} from './supplier.types';

export class SupplierService {
  private readonly repo: SupplierRepository;
  private readonly prismaClient?: PrismaClient;

  constructor(repoOrPrisma?: SupplierRepository | PrismaClient) {
    if (repoOrPrisma && 'findById' in repoOrPrisma) {
      this.repo = repoOrPrisma;
    } else if (repoOrPrisma) {
      this.prismaClient = repoOrPrisma as PrismaClient;
      this.repo = new SupplierRepository(this.prismaClient);
    } else {
      this.repo = supplierRepository;
    }
  }

  public mapToDto(supplier: Supplier): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      gstNumber: supplier.gstNumber,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      country: supplier.country,
      postalCode: supplier.postalCode,
      notes: supplier.notes,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }

  public async listSuppliers(filter: SupplierQueryFilter): Promise<PaginatedSuppliersResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { suppliers, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      suppliers: suppliers.map((s) => this.mapToDto(s)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getSupplierById(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.repo.findById(id);
    if (!supplier) {
      throw new AppError('SUPPLIER_NOT_FOUND', 'Supplier record not found.', 404);
    }
    return this.mapToDto(supplier);
  }

  public async createSupplier(
    dto: CreateSupplierDto,
    adminUser: AccessTokenPayload,
  ): Promise<SupplierResponseDto> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new BadRequestError(
        'SUPPLIER_NAME_EXISTS',
        'A supplier with this name already exists.',
      );
    }

    const created = await this.repo.create(dto);

    await settingsService.logAuditAction(
      {
        userId: adminUser.userId,
        userName: adminUser.email,
        action: 'SUPPLIER_CREATED',
        entityType: 'SUPPLIER',
        entityId: created.id,
        newValue: JSON.stringify({ name: created.name, phone: created.phone, gstNumber: created.gstNumber, city: created.city }),
      },
      this.prismaClient,
    );

    return this.mapToDto(created);
  }

  public async updateSupplier(
    id: string,
    dto: UpdateSupplierDto,
    adminUser: AccessTokenPayload,
  ): Promise<SupplierResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('SUPPLIER_NOT_FOUND', 'Supplier record not found.', 404);
    }

    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameConflict = await this.repo.findByName(dto.name);
      if (nameConflict) {
        throw new BadRequestError(
          'SUPPLIER_NAME_EXISTS',
          'A supplier with this name already exists.',
        );
      }
    }

    const updated = await this.repo.update(id, dto);

    await settingsService.logAuditAction(
      {
        userId: adminUser.userId,
        userName: adminUser.email,
        action: 'SUPPLIER_UPDATED',
        entityType: 'SUPPLIER',
        entityId: updated.id,
        previousValue: JSON.stringify({ name: existing.name, phone: existing.phone, city: existing.city }),
        newValue: JSON.stringify({ name: updated.name, phone: updated.phone, city: updated.city }),
      },
      this.prismaClient,
    );

    return this.mapToDto(updated);
  }

  public async updateSupplierStatus(
    id: string,
    dto: UpdateSupplierStatusDto,
    adminUser: AccessTokenPayload,
  ): Promise<SupplierResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('SUPPLIER_NOT_FOUND', 'Supplier record not found.', 404);
    }

    const updated = await this.repo.updateStatus(id, dto.isActive);

    const action = dto.isActive ? 'SUPPLIER_ACTIVATED' : 'SUPPLIER_DEACTIVATED';
    await settingsService.logAuditAction(
      {
        userId: adminUser.userId,
        userName: adminUser.email,
        action,
        entityType: 'SUPPLIER',
        entityId: updated.id,
        previousValue: JSON.stringify({ isActive: existing.isActive }),
        newValue: JSON.stringify({ isActive: updated.isActive }),
      },
      this.prismaClient,
    );

    return this.mapToDto(updated);
  }
}

export const supplierService = new SupplierService();
