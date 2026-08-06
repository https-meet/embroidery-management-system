import type { Design, PrismaClient } from '@prisma/client';
import { AppError, ConflictError } from '../../utils/errors';
import { DesignRepository, designRepository } from './design.repository';
import type {
  CreateDesignDto,
  DesignQueryFilter,
  DesignResponseDto,
  PaginatedDesignsResponseDto,
  UpdateDesignDto,
} from './design.types';

export class DesignService {
  private readonly repo: DesignRepository;
  private readonly prismaClient?: PrismaClient;

  constructor(repoOrPrisma?: DesignRepository | PrismaClient) {
    if (repoOrPrisma && 'findById' in repoOrPrisma) {
      this.repo = repoOrPrisma;
    } else if (repoOrPrisma) {
      this.prismaClient = repoOrPrisma as PrismaClient;
      this.repo = new DesignRepository(this.prismaClient);
    } else {
      this.repo = designRepository;
    }
  }

  /**
   * Generates design code format DES-YYYY-NNNNNN (e.g. DES-2026-000001)
   */
  private async generateDesignCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.repo.countTotalForYear(currentYear);
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(6, '0');
    return `DES-${currentYear}-${padded}`;
  }

  private mapToDto(design: Design): DesignResponseDto {
    return {
      id: design.id,
      designCode: design.designCode,
      name: design.name,
      description: design.description,
      category: design.category,
      previewUrl: design.previewUrl,
      primaryFileUrl: design.primaryFileUrl,
      primaryFileType: design.primaryFileType,
      stitchCount: design.stitchCount,
      widthMm: design.widthMm,
      heightMm: design.heightMm,
      colorCount: design.colorCount,
      notes: design.notes,
      isActive: design.isActive,
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
    };
  }

  public async createDesign(dto: CreateDesignDto): Promise<DesignResponseDto> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ConflictError('DUPLICATE_DESIGN', 'A design with the same name already exists.');
    }

    const designCode = await this.generateDesignCode();
    const design = await this.repo.create({ ...dto, designCode });

    return this.mapToDto(design);
  }

  public async getDesignById(id: string): Promise<DesignResponseDto> {
    const design = await this.repo.findById(id);
    if (!design) {
      throw new AppError('DESIGN_NOT_FOUND', 'Design not found.', 404);
    }
    return this.mapToDto(design);
  }

  public async listDesigns(filter: DesignQueryFilter): Promise<PaginatedDesignsResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { designs, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      designs: designs.map((d) => this.mapToDto(d)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async updateDesign(id: string, dto: UpdateDesignDto): Promise<DesignResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('DESIGN_NOT_FOUND', 'Design not found.', 404);
    }

    const updated = await this.repo.update(id, dto);
    return this.mapToDto(updated);
  }

  public async archiveDesign(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('DESIGN_NOT_FOUND', 'Design not found.', 404);
    }

    await this.repo.archive(id);
  }
}

export const designService = new DesignService();
