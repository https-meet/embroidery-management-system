import type { Customer, Design, Job, JobItem, Priority } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import { customerRepository } from '../../customer/customer.repository';
import { designRepository } from '../../design/design.repository';
import { jobRepository } from '../job.repository';
import jobRouter from '../job.router';
import type { UpdateJobDto } from '../job.types';

type FullJobMock = Job & {
  customer: Customer;
  items: (JobItem & { design: Design | null })[];
};

class MockJobRepository {
  public jobs: Map<string, FullJobMock> = new Map();
  public customers: Map<string, Customer> = new Map();
  public designs: Map<string, Design> = new Map();

  public async findById(id: string): Promise<FullJobMock | null> {
    const j = this.jobs.get(id);
    if (!j || j.deletedAt !== null) return null;
    return j;
  }

  public async findByJobNo(jobNo: string): Promise<FullJobMock | null> {
    for (const j of this.jobs.values()) {
      if (j.jobNo === jobNo && j.deletedAt === null) return j;
    }
    return null;
  }

  public async countTotalForYear(year: number): Promise<number> {
    let count = 0;
    for (const j of this.jobs.values()) {
      if (j.createdAt.getFullYear() === year) {
        count++;
      }
    }
    return count;
  }

  public async create(data: {
    jobNo: string;
    customerId: string;
    jobDate?: string;
    expectedDeliveryDate?: string;
    priority?: Priority;
    notes?: string;
    createdBy?: string;
    items: {
      designId?: string;
      position: string;
      quantity: number;
      rate: number;
      threadColor?: string;
      dimensions?: string;
      remarks?: string;
    }[];
  }): Promise<FullJobMock> {
    const customer = this.customers.get(data.customerId);
    if (!customer) throw new Error('Customer not found');

    const createdItems: (JobItem & { design: Design | null })[] = data.items.map((item, idx) => {
      const design = item.designId ? (this.designs.get(item.designId) ?? null) : null;
      return {
        id: `item-${Date.now()}-${idx}`,
        jobId: '',
        designId: item.designId ?? null,
        design,
        position: item.position,
        quantity: item.quantity,
        rate: item.rate,
        lineTotal: item.quantity * item.rate,
        threadColor: item.threadColor ?? null,
        dimensions: item.dimensions ?? null,
        remarks: item.remarks ?? null,
        productionStatus: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const jobId = `uuid-job-${Date.now()}-${Math.random()}`;
    createdItems.forEach((i) => {
      i.jobId = jobId;
    });

    const job: FullJobMock = {
      id: jobId,
      jobNo: data.jobNo,
      customerId: data.customerId,
      customer,
      jobDate: data.jobDate ? new Date(data.jobDate) : new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
      priority: data.priority ?? 'NORMAL',
      status: 'DRAFT',
      assignedOperator: null,
      startedAt: null,
      completedAt: null,
      qualityCheckedAt: null,
      qualityCheckedBy: null,
      deliveredAt: null,
      notes: data.notes ?? null,
      createdBy: data.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      items: createdItems,
    };

    this.jobs.set(jobId, job);
    return job;
  }

  public async update(id: string, data: UpdateJobDto): Promise<FullJobMock> {
    const existing = this.jobs.get(id);
    if (!existing) throw new Error('Job not found');
    const updated: FullJobMock = {
      ...existing,
      ...(data.jobDate && { jobDate: new Date(data.jobDate) }),
      ...(data.expectedDeliveryDate !== undefined && {
        expectedDeliveryDate: data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : null,
      }),
      ...(data.priority && { priority: data.priority }),
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      updatedAt: new Date(),
    };
    this.jobs.set(id, updated);
    return updated;
  }

  public async archive(id: string): Promise<Job> {
    const existing = this.jobs.get(id);
    if (!existing) throw new Error('Job not found');
    const archived: FullJobMock = {
      ...existing,
      deletedAt: new Date(),
      status: 'CANCELLED',
    };
    this.jobs.set(id, archived);
    return archived;
  }

  public async findMany(filter: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: FullJobMock[]; total: number }> {
    let list = Array.from(this.jobs.values()).filter((j) => j.deletedAt === null);

    if (filter.status) {
      list = list.filter((j) => j.status === filter.status);
    }

    if (filter.priority) {
      list = list.filter((j) => j.priority === filter.priority);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.jobNo.toLowerCase().includes(q) ||
          j.customer.name.toLowerCase().includes(q) ||
          (j.notes && j.notes.toLowerCase().includes(q)),
      );
    }

    const total = list.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { jobs: paginated, total };
  }
}

describe('Job / Order Management Integration Test Suite', () => {
  let mockJobRepo: MockJobRepository;
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let operatorToken: string;
  let testCustomerId: string;
  let testDesignId: string;

  beforeEach(() => {
    mockJobRepo = new MockJobRepository();

    jobRepository.findById = mockJobRepo.findById.bind(mockJobRepo);
    jobRepository.findByJobNo = mockJobRepo.findByJobNo.bind(mockJobRepo);
    jobRepository.countTotalForYear = mockJobRepo.countTotalForYear.bind(mockJobRepo);
    jobRepository.create = mockJobRepo.create.bind(mockJobRepo);
    jobRepository.update = mockJobRepo.update.bind(mockJobRepo);
    jobRepository.archive = mockJobRepo.archive.bind(mockJobRepo);
    jobRepository.findMany = mockJobRepo.findMany.bind(mockJobRepo);

    // Mock customer & design repository calls
    testCustomerId = '11111111-1111-4111-8111-111111111111';
    testDesignId = '22222222-2222-4222-8222-222222222222';

    const mockCustomer: Customer = {
      id: testCustomerId,
      customerCode: 'CUS-000001',
      customerType: 'INDIVIDUAL',
      name: 'Client Corporation',
      contactPerson: 'Jane Doe',
      mobile: '9876543210',
      alternateMobile: null,
      email: 'jane@client.com',
      address: null,
      notes: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockJobRepo.customers.set(testCustomerId, mockCustomer);

    const mockDesign: Design = {
      id: testDesignId,
      designCode: 'DES-2026-000001',
      name: 'Logo Stamp',
      description: null,
      category: 'Logos',
      previewUrl: null,
      primaryFileUrl: null,
      primaryFileType: 'DST',
      stitchCount: 5000,
      widthMm: null,
      heightMm: null,
      colorCount: null,
      notes: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockJobRepo.designs.set(testDesignId, mockDesign);

    customerRepository.findById = async (id: string) => {
      return mockJobRepo.customers.get(id) ?? null;
    };

    designRepository.findById = async (id: string) => {
      return mockJobRepo.designs.get(id) ?? null;
    };

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/jobs', jobRouter);
    v1.use('/orders', jobRouter);

    app.use('/api/v1', v1);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);

    adminToken = jwtService.generateAccessToken({
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    operatorToken = jwtService.generateAccessToken({
      id: 'operator-1',
      email: 'op@example.com',
      role: 'OPERATOR',
    });
  });

  describe('POST /api/v1/jobs & /api/v1/orders', () => {
    it('should create a job with sequential code JOB-YYYY-000001 and calculate totalAmount', async () => {
      const currentYear = new Date().getFullYear();
      const res = await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          priority: 'HIGH',
          items: [
            {
              designId: testDesignId,
              position: 'Left Chest',
              quantity: 10,
              rate: 15.0,
            },
            {
              position: 'Back Collar',
              quantity: 5,
              rate: 20.0,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.jobNo).toMatch(/^JOB-\d{4}-\d{6}$/);
      expect(res.body.data.job.priority).toBe('HIGH');
      expect(res.body.data.job.items).toHaveLength(2);
      expect(res.body.data.job.totalAmount).toBe(250.0); // 10*15 + 5*20
    });

    it('should also accept order creation on /api/v1/orders alias', async () => {
      const res = await request
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            {
              position: 'Front Pocket',
              quantity: 2,
              rate: 50.0,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.totalAmount).toBe(100.0);
    });

    it('should reject creation when target customer does not exist (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          items: [{ position: 'Cap', quantity: 1, rate: 10 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CUSTOMER');
    });

    it('should reject creation when referenced design does not exist (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            {
              designId: '00000000-0000-0000-0000-000000000000',
              position: 'Sleeve',
              quantity: 1,
              rate: 10,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_DESIGN');
    });

    it('should reject creation when items array is empty (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/jobs & Search/Filtering/Pagination', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          priority: 'NORMAL',
          items: [{ position: 'Front', quantity: 5, rate: 10 }],
        });

      await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          priority: 'HIGH',
          items: [{ position: 'Back', quantity: 10, rate: 20 }],
        });
    });

    it('should list all active jobs with pagination metadata', async () => {
      const res = await request.get('/api/v1/jobs').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobs).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('should filter jobs by priority', async () => {
      const res = await request
        .get('/api/v1/jobs?priority=HIGH')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(1);
      expect(res.body.data.jobs[0].priority).toBe('HIGH');
    });
  });

  describe('PUT & Status Lifecycle & DELETE /api/v1/jobs/:id', () => {
    let jobId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [{ position: 'Chest', quantity: 1, rate: 100 }],
        });

      jobId = createRes.body.data.job.id;
    });

    it('should update job status (DRAFT -> IN_PROGRESS)', async () => {
      const res = await request
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.job.status).toBe('IN_PROGRESS');
    });

    it('should prevent DELIVERED job from returning to DRAFT (400 Bad Request)', async () => {
      await request
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELIVERED' });

      const invalidRes = await request
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DRAFT' });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should archive/cancel job (ADMIN role)', async () => {
      const res = await request
        .delete(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Job archived successfully.');
    });

    it('should reject archive/cancel attempt from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .delete(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});
