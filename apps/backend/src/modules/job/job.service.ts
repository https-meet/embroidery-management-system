import type { PrismaClient } from '@prisma/client';
import { AppError, BadRequestError } from '../../utils/errors';
import { CustomerRepository, customerRepository } from '../customer/customer.repository';
import { DesignRepository, designRepository } from '../design/design.repository';
import { DocumentSequenceService, documentSequenceService } from '../sequence/document-sequence.service';
import { DocumentType } from '../sequence/document-sequence.types';
import { JobRepository, jobRepository, type FullJob } from './job.repository';
import type {
  CreateJobDto,
  JobQueryFilter,
  JobResponseDto,
  PaginatedJobsResponseDto,
  UpdateJobDto,
} from './job.types';

export class JobService {
  private readonly repo: JobRepository;
  private readonly customerRepo: CustomerRepository;
  private readonly designRepo: DesignRepository;
  private readonly seqService: DocumentSequenceService;
  private readonly prismaClient?: PrismaClient;

  constructor(repoOrPrisma?: JobRepository | PrismaClient) {
    if (repoOrPrisma && 'findById' in repoOrPrisma) {
      this.repo = repoOrPrisma;
      this.customerRepo = customerRepository;
      this.designRepo = designRepository;
      this.seqService = documentSequenceService;
    } else if (repoOrPrisma) {
      this.prismaClient = repoOrPrisma as PrismaClient;
      this.repo = new JobRepository(this.prismaClient);
      this.customerRepo = new CustomerRepository(this.prismaClient);
      this.designRepo = new DesignRepository(this.prismaClient);
      this.seqService = new DocumentSequenceService(this.prismaClient);
    } else {
      this.repo = jobRepository;
      this.customerRepo = customerRepository;
      this.designRepo = designRepository;
      this.seqService = documentSequenceService;
    }
  }

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
      assignedOperator: job.assignedOperator,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      qualityCheckedAt: job.qualityCheckedAt,
      qualityCheckedBy: job.qualityCheckedBy,
      deliveredAt: job.deliveredAt,
      notes: job.notes,
      createdBy: job.createdBy,
      items,
      totalAmount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  public async createJob(dto: CreateJobDto, userEmail?: string): Promise<JobResponseDto> {
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestError('INVALID_CUSTOMER', 'Target customer does not exist.');
    }

    for (const item of dto.items) {
      if (item.designId) {
        const design = await this.designRepo.findById(item.designId);
        if (!design) {
          throw new BadRequestError('INVALID_DESIGN', `Design ${item.designId} does not exist.`);
        }
      }
    }

    const jobNo = await this.seqService.generateNextNumber(DocumentType.JOB, {
      date: dto.jobDate ? new Date(dto.jobDate) : undefined,
    });
    const job = await this.repo.create({ ...dto, jobNo, createdBy: userEmail });

    return this.mapToDto(job);
  }

  public async getJobById(id: string): Promise<JobResponseDto> {
    const job = await this.repo.findById(id);
    if (!job) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }
    return this.mapToDto(job);
  }

  public async listJobs(filter: JobQueryFilter): Promise<PaginatedJobsResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { jobs, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      jobs: jobs.map((j) => this.mapToDto(j)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async updateJob(id: string, dto: UpdateJobDto): Promise<JobResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    if (dto.status && existing.status === 'DELIVERED' && dto.status === 'DRAFT') {
      throw new BadRequestError(
        'INVALID_STATUS_TRANSITION',
        'Delivered Jobs cannot be returned to Draft status.',
      );
    }

    const updated = await this.repo.update(id, dto);
    return this.mapToDto(updated);
  }

  public async archiveJob(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('JOB_NOT_FOUND', 'Job not found.', 404);
    }

    await this.repo.archive(id);
  }
}

export const jobService = new JobService();
