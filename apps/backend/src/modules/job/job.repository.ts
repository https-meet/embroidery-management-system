import type { Customer, Design, Job, JobItem, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CreateJobDto, JobQueryFilter, UpdateJobDto } from './job.types';

export type FullJob = Job & {
  customer: Customer;
  items: (JobItem & { design: Design | null })[];
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

  public async create(
    data: CreateJobDto & { jobNo: string; createdBy?: string },
  ): Promise<FullJob> {
    return prisma.job.create({
      data: {
        jobNo: data.jobNo,
        customerId: data.customerId,
        jobDate: data.jobDate ? new Date(data.jobDate) : new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : null,
        priority: data.priority ?? 'NORMAL',
        notes: data.notes || null,
        createdBy: data.createdBy || null,
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

  public async findMany(filter: JobQueryFilter): Promise<{ jobs: FullJob[]; total: number }> {
    const search = filter.search;
    const customerId = filter.customerId;
    const status = filter.status;
    const priority = filter.priority;
    const page = typeof filter.page === 'string' ? parseInt(filter.page, 10) || 1 : (filter.page ?? 1);
    const limit = typeof filter.limit === 'string' ? parseInt(filter.limit, 10) || 20 : (filter.limit ?? 20);
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
          { customer: { customerCode: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
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

export const jobRepository = new JobRepository();
