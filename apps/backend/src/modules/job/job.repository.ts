import type { CustomerType, Job, JobItemProductionStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateJobDto, JobQueryFilter, UpdateJobDto } from './job.types';

export type FullJob = Job & {
  customer: {
    id: string;
    customerCode: string;
    customerType: CustomerType;
    name: string;
    contactPerson: string | null;
    mobile: string | null;
    alternateMobile: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  items: Array<{
    id: string;
    jobId: string;
    designId: string | null;
    design: {
      id: string;
      designCode: string;
      name: string;
      description: string | null;
      category: string | null;
      previewUrl: string | null;
      primaryFileUrl: string | null;
      primaryFileType: string | null;
      stitchCount: number | null;
      widthMm: number | null;
      heightMm: number | null;
      colorCount: number | null;
      notes: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    position: string;
    quantity: number;
    rate: number;
    lineTotal: number;
    threadColor: string | null;
    dimensions: string | null;
    remarks: string | null;
    productionStatus: JobItemProductionStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export class JobRepository {
  public async findById(id: string): Promise<FullJob | null> {
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

  public async findByJobNo(jobNo: string): Promise<FullJob | null> {
    return prisma.job.findFirst({
      where: { jobNo, deletedAt: null },
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

  public async countTotalForYear(year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.job.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  public async create(data: CreateJobDto & { jobNo: string; createdBy?: string }): Promise<FullJob> {
    return prisma.job.create({
      data: {
        jobNo: data.jobNo,
        customerId: data.customerId,
        jobDate: data.jobDate ? new Date(data.jobDate) : new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        priority: data.priority,
        notes: data.notes ?? null,
        createdBy: data.createdBy ?? null,
        items: {
          create: data.items.map((item) => ({
            designId: item.designId || null,
            position: item.position,
            quantity: item.quantity,
            rate: item.rate,
            lineTotal: item.quantity * item.rate,
            threadColor: item.threadColor || null,
            dimensions: item.dimensions || null,
            remarks: item.remarks || null,
          })),
        },
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

  public async update(id: string, data: UpdateJobDto): Promise<FullJob> {
    return prisma.job.update({
      where: { id },
      data: {
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.assignedOperator !== undefined && {
          assignedOperator: data.assignedOperator || null,
        }),
        ...(data.jobDate && { jobDate: new Date(data.jobDate) }),
        ...(data.expectedDeliveryDate !== undefined && {
          expectedDeliveryDate: data.expectedDeliveryDate
            ? new Date(data.expectedDeliveryDate)
            : null,
        }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
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

  public async archive(id: string): Promise<Job> {
    return prisma.job.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'CANCELLED',
      },
    });
  }

  public async findMany(
    filter: JobQueryFilter,
  ): Promise<{ jobs: FullJob[]; total: number }> {
    const search = filter.search;
    const customerId = filter.customerId;
    const status = filter.status;
    const priority = filter.priority;
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { jobNo: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
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
      prisma.job.count({ where }),
    ]);

    return { jobs, total };
  }
}

export const jobRepository = new JobRepository();
