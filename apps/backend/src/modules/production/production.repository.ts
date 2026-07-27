import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { FullJob } from '../job/job.repository';
import type { ProductionQueryFilter } from './production.types';

export class ProductionRepository {
  public async findJobById(id: string): Promise<FullJob | null> {
    return prisma.job.findFirst({
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
    return prisma.job.update({
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
    await prisma.jobItem.updateMany({
      where: { jobId },
      data: { productionStatus: 'IN_PRODUCTION' },
    });

    return prisma.job.update({
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
    await prisma.jobItem.updateMany({
      where: { jobId },
      data: { productionStatus: 'COMPLETED' },
    });

    return prisma.job.update({
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
  ): Promise<FullJob> {
    const now = new Date();
    return prisma.job.update({
      where: { id: jobId },
      data: {
        qualityCheckedAt: now,
        qualityCheckedBy: inspector,
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
    return prisma.job.update({
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
    const {
      search,
      assignedOperator,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

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
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      prisma.job.count({ where }),
    ]);

    return { jobs, total };
  }
}

export const productionRepository = new ProductionRepository();
