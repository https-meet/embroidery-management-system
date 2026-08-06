import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type { FullJob } from '../job/job.repository';
import type { ProductionQueryFilter } from './production.types';

export class ProductionRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findJobById(id: string): Promise<FullJob | null> {
    return this.prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async assignOperator(jobId: string, operator: string): Promise<FullJob> {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        assignedOperator: operator,
      },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async startProduction(jobId: string): Promise<FullJob> {
    const now = new Date();
    await this.prisma.jobItem.updateMany({
      where: { jobId },
      data: { productionStatus: 'EMBROIDERING' },
    });

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: now,
      },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async completeProduction(jobId: string): Promise<FullJob> {
    const now = new Date();
    await this.prisma.jobItem.updateMany({
      where: { jobId },
      data: { productionStatus: 'CLEANING' },
    });

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: now,
      },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async recordQualityCheck(
    jobId: string,
    passed: boolean,
    inspector: string,
    notes?: string,
  ): Promise<FullJob> {
    const now = new Date();
    const existingJob = await this.prisma.job.findUnique({ where: { id: jobId } });
    const updatedNotes = notes
      ? (existingJob?.notes ? `${existingJob.notes}\n[QC ${passed ? 'PASSED' : 'DEFECT'}]: ${notes}` : `[QC ${passed ? 'PASSED' : 'DEFECT'}]: ${notes}`)
      : existingJob?.notes;

    const resultTag = passed ? ' (PASSED)' : ' (FAILED)';
    const cleanInspector = inspector.replace(/\s*\((PASSED|FAILED)\)/gi, '');

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        qualityCheckedAt: now,
        qualityCheckedBy: `${cleanInspector}${resultTag}`,
        notes: updatedNotes,
        ...(passed ? {} : { status: 'IN_PROGRESS' }),
      },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async markReadyForDelivery(jobId: string): Promise<FullJob> {
    const now = new Date();
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'DELIVERED',
        deliveredAt: now,
      },
      include: {
        customer: true,
        items: {
          include: {
            design: true,
          },
        },
      },
    });
  }

  public async findProductionQueue(
    filter: ProductionQueryFilter,
  ): Promise<{ jobs: FullJob[]; total: number }> {
    const search = filter.search;
    const assignedOperator = filter.assignedOperator;
    const status = filter.status;
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      ...(assignedOperator && { assignedOperator }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { jobNo: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { assignedOperator: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          items: {
            include: {
              design: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return { jobs, total };
  }
}

export const productionRepository = new ProductionRepository();
