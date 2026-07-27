import { AppError, BadRequestError } from '../../utils/errors';
import type { FullJob } from '../job/job.repository';
import type { JobResponseDto } from '../job/job.types';
import { productionRepository, type ProductionRepository } from './production.repository';
import type {
  AssignProductionDto,
  CompleteProductionDto,
  DeliveryReadinessDto,
  PaginatedProductionQueueResponseDto,
  ProductionQueryFilter,
  QualityCheckDto,
  StartProductionDto,
} from './production.types';

export class ProductionService {
  constructor(private readonly repo: ProductionRepository = productionRepository) {}

  private mapToDto(job: FullJob): JobResponseDto {
    const items = (job.items || []).map((item) => ({
      id: item.id,
      jobId: item.jobId,
      designId: item.designId,
      design: item.design
        ? {
            id: item.design.id,
            designCode: item.design.designCode,
            name: item.design.name,
            description: item.design.description,
            category: item.design.category,
            previewUrl: item.design.previewUrl,
            primaryFileUrl: item.design.primaryFileUrl,
            primaryFileType: item.design.primaryFileType,
            stitchCount: item.design.stitchCount,
            widthMm: item.design.widthMm,
            heightMm: item.design.heightMm,
            colorCount: item.design.colorCount,
            notes: item.design.notes,
            isActive: item.design.isActive,
            createdAt: item.design.createdAt,
            updatedAt: item.design.updatedAt,
          }
        : null,
      position: item.position,
      quantity: item.quantity,
      rate: item.rate,
      lineTotal: item.lineTotal,
      threadColor: item.threadColor,
      dimensions: item.dimensions,
      remarks: item.remarks,
      productionStatus: item.productionStatus,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      id: job.id,
      jobNo: job.jobNo,
      customerId: job.customerId,
      customer: job.customer
        ? {
            id: job.customer.id,
            customerCode: job.customer.customerCode,
            customerType: job.customer.customerType,
            name: job.customer.name,
            contactPerson: job.customer.contactPerson,
            mobile: job.customer.mobile,
            alternateMobile: job.customer.alternateMobile,
            email: job.customer.email,
            address: job.customer.address,
            notes: job.customer.notes,
            isActive: job.customer.isActive,
            createdAt: job.customer.createdAt,
            updatedAt: job.customer.updatedAt,
          }
        : undefined,
      jobDate: job.jobDate,
      expectedDeliveryDate: job.expectedDeliveryDate,
      priority: job.priority,
      status: job.status,
      notes: job.notes,
      createdBy: job.createdBy,
      items,
      totalAmount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  public async assignOperator(dto: AssignProductionDto): Promise<JobResponseDto> {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (job.status === 'CANCELLED' || job.status === 'DELIVERED') {
      throw new BadRequestError(
        'INVALID_WORKFLOW_STATE',
        'Cannot assign operator to a closed or cancelled job.',
      );
    }

    const updated = await this.repo.assignOperator(dto.jobId, dto.assignedOperator);
    return this.mapToDto(updated);
  }

  public async startProduction(dto: StartProductionDto): Promise<JobResponseDto> {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (job.status === 'CANCELLED' || job.status === 'DELIVERED') {
      throw new BadRequestError(
        'INVALID_WORKFLOW_STATE',
        'Cannot start production on a closed or cancelled job.',
      );
    }

    const updated = await this.repo.startProduction(dto.jobId);
    return this.mapToDto(updated);
  }

  public async completeProduction(dto: CompleteProductionDto): Promise<JobResponseDto> {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (job.status !== 'IN_PROGRESS') {
      throw new BadRequestError(
        'INVALID_WORKFLOW_STATE',
        'Production can only be completed for jobs that are currently IN_PROGRESS.',
      );
    }

    const updated = await this.repo.completeProduction(dto.jobId);
    return this.mapToDto(updated);
  }

  public async recordQualityCheck(
    dto: QualityCheckDto,
    inspectorEmail?: string,
  ): Promise<JobResponseDto> {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (job.status !== 'COMPLETED' && job.status !== 'IN_PROGRESS') {
      throw new BadRequestError(
        'INVALID_WORKFLOW_STATE',
        'Quality check can only be performed on completed or in-progress jobs.',
      );
    }

    const inspector = inspectorEmail || 'system';
    const updated = await this.repo.recordQualityCheck(dto.jobId, dto.passed, inspector);
    return this.mapToDto(updated);
  }

  public async markReadyForDelivery(dto: DeliveryReadinessDto): Promise<JobResponseDto> {
    const job = await this.repo.findJobById(dto.jobId);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (job.status !== 'COMPLETED') {
      throw new BadRequestError(
        'INVALID_WORKFLOW_STATE',
        'Job must be in COMPLETED status before it can be marked as DELIVERED.',
      );
    }

    const updated = await this.repo.markReadyForDelivery(dto.jobId);
    return this.mapToDto(updated);
  }

  public async getProductionQueue(
    filter: ProductionQueryFilter,
  ): Promise<PaginatedProductionQueueResponseDto> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const { jobs, total } = await this.repo.findProductionQueue(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      jobs: jobs.map((j) => this.mapToDto(j)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export const productionService = new ProductionService();
