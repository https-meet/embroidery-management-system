import type { Customer, Design, Job, JobItem } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import { jobRepository } from '../../job/job.repository';
import { productionRepository } from '../production.repository';
import productionRouter from '../production.router';

type FullJobMock = Job & {
  customer: Customer;
  items: (JobItem & { design: Design | null })[];
};

class MockProductionRepository {
  public jobs: Map<string, FullJobMock> = new Map();

  public async findJobById(id: string): Promise<FullJobMock | null> {
    const j = this.jobs.get(id);
    if (!j || j.deletedAt !== null) return null;
    return j;
  }

  public async assignOperator(jobId: string, operator: string): Promise<FullJobMock> {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    const updated: FullJobMock = { ...j, assignedOperator: operator, updatedAt: new Date() };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async startProduction(jobId: string): Promise<FullJobMock> {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    const now = new Date();
    const updatedItems = j.items.map((i) => ({ ...i, productionStatus: 'EMBROIDERING' as const }));
    const updated: FullJobMock = {
      ...j,
      status: 'IN_PROGRESS',
      startedAt: now,
      items: updatedItems,
      updatedAt: now,
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async completeProduction(jobId: string): Promise<FullJobMock> {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    const now = new Date();
    const updatedItems = j.items.map((i) => ({ ...i, productionStatus: 'PASSED_QC' as const }));
    const updated: FullJobMock = {
      ...j,
      status: 'COMPLETED',
      completedAt: now,
      items: updatedItems,
      updatedAt: now,
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async recordQualityCheck(
    jobId: string,
    passed: boolean,
    inspector: string,
  ): Promise<FullJobMock> {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    const now = new Date();
    const updated: FullJobMock = {
      ...j,
      qualityCheckedAt: now,
      qualityCheckedBy: inspector,
      ...(passed ? {} : { status: 'IN_PROGRESS' as const }),
      updatedAt: now,
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async markReadyForDelivery(jobId: string): Promise<FullJobMock> {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    const now = new Date();
    const updated: FullJobMock = {
      ...j,
      status: 'DELIVERED',
      deliveredAt: now,
      updatedAt: now,
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async findProductionQueue(filter: {
    search?: string;
    assignedOperator?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: FullJobMock[]; total: number }> {
    let list = Array.from(this.jobs.values()).filter((j) => j.deletedAt === null);

    if (filter.assignedOperator) {
      list = list.filter((j) => j.assignedOperator === filter.assignedOperator);
    }

    if (filter.status) {
      list = list.filter((j) => j.status === filter.status);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.jobNo.toLowerCase().includes(q) ||
          j.customer.name.toLowerCase().includes(q) ||
          (j.assignedOperator && j.assignedOperator.toLowerCase().includes(q)),
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

describe('Production Workflow Integration Test Suite', () => {
  let mockProdRepo: MockProductionRepository;
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let managerToken: string;
  let operatorToken: string;
  let testJobId: string;

  beforeEach(() => {
    mockProdRepo = new MockProductionRepository();

    productionRepository.findJobById = mockProdRepo.findJobById.bind(mockProdRepo);
    productionRepository.assignOperator = mockProdRepo.assignOperator.bind(mockProdRepo);
    productionRepository.startProduction = mockProdRepo.startProduction.bind(mockProdRepo);
    productionRepository.completeProduction = mockProdRepo.completeProduction.bind(mockProdRepo);
    productionRepository.recordQualityCheck = mockProdRepo.recordQualityCheck.bind(mockProdRepo);
    productionRepository.markReadyForDelivery =
      mockProdRepo.markReadyForDelivery.bind(mockProdRepo);
    productionRepository.findProductionQueue = mockProdRepo.findProductionQueue.bind(mockProdRepo);

    testJobId = '11111111-2222-4333-8444-555555555555';

    const mockCustomer: Customer = {
      id: 'cus-1',
      customerCode: 'CUS-000001',
      customerType: 'INDIVIDUAL',
      name: 'Production Test Client',
      contactPerson: null,
      mobile: '9876543210',
      alternateMobile: null,
      email: null,
      address: null,
      notes: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockJob: FullJobMock = {
      id: testJobId,
      jobNo: 'JOB-2026-000001',
      customerId: mockCustomer.id,
      customer: mockCustomer,
      jobDate: new Date(),
      expectedDeliveryDate: null,
      priority: 'NORMAL',
      status: 'DRAFT',
      assignedOperator: null,
      startedAt: null,
      completedAt: null,
      qualityCheckedAt: null,
      qualityCheckedBy: null,
      deliveredAt: null,
      notes: null,
      createdBy: 'admin@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      items: [
        {
          id: 'item-1',
          jobId: testJobId,
          designId: null,
          design: null,
          position: 'Left Sleeve',
          quantity: 10,
          rate: 25.0,
          lineTotal: 250.0,
          threadColor: 'Navy Blue',
          dimensions: null,
          remarks: null,
          productionStatus: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    mockProdRepo.jobs.set(testJobId, mockJob);

    // Mock jobRepository findById for production service calls
    jobRepository.findById = async (id: string) => {
      return mockProdRepo.jobs.get(id) ?? null;
    };

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/production', productionRouter);

    app.use('/api/v1', v1);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);

    adminToken = jwtService.generateAccessToken({
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    managerToken = jwtService.generateAccessToken({
      id: 'manager-1',
      email: 'manager@example.com',
      role: 'MANAGER',
    });

    operatorToken = jwtService.generateAccessToken({
      id: 'operator-1',
      email: 'op@example.com',
      role: 'OPERATOR',
    });
  });

  describe('POST /api/v1/production/assign', () => {
    it('should assign operator to job (MANAGER role)', async () => {
      const res = await request
        .post('/api/v1/production/assign')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          jobId: testJobId,
          assignedOperator: 'Operator Mark',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.assignedOperator).toBe('Operator Mark');
    });

    it('should reject operator assignment from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .post('/api/v1/production/assign')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          jobId: testJobId,
          assignedOperator: 'Operator Self',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('POST /api/v1/production/start', () => {
    it('should start production and transition job status to IN_PROGRESS with startedAt timestamp', async () => {
      const res = await request
        .post('/api/v1/production/start')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.status).toBe('IN_PROGRESS');
      expect(res.body.data.job.items[0].productionStatus).toBe('EMBROIDERING');
    });

    it('should reject start production for non-existent job (404 Not Found)', async () => {
      const res = await request
        .post('/api/v1/production/start')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('JOB_NOT_FOUND');
    });
  });

  describe('POST /api/v1/production/complete', () => {
    beforeEach(async () => {
      // Transition job to IN_PROGRESS
      await request
        .post('/api/v1/production/start')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });
    });

    it('should complete production and transition status to COMPLETED', async () => {
      const res = await request
        .post('/api/v1/production/complete')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.status).toBe('COMPLETED');
      expect(res.body.data.job.items[0].productionStatus).toBe('PASSED_QC');
    });

    it('should reject completing production on DRAFT job (400 Bad Request)', async () => {
      const draftJobId = '99999999-9999-4999-8999-999999999999';
      const draftJob: FullJobMock = {
        id: draftJobId,
        jobNo: 'JOB-2026-000002',
        customerId: 'cus-1',
        customer: mockProdRepo.jobs.get(testJobId)!.customer,
        jobDate: new Date(),
        expectedDeliveryDate: null,
        priority: 'NORMAL',
        status: 'DRAFT',
        assignedOperator: null,
        startedAt: null,
        completedAt: null,
        qualityCheckedAt: null,
        qualityCheckedBy: null,
        deliveredAt: null,
        notes: null,
        createdBy: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        items: [],
      };
      mockProdRepo.jobs.set(draftJobId, draftJob);

      const res = await request
        .post('/api/v1/production/complete')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: draftJobId });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_WORKFLOW_STATE');
    });
  });

  describe('POST /api/v1/production/quality-check', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/production/start')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });

      await request
        .post('/api/v1/production/complete')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });
    });

    it('should record quality check pass (MANAGER role)', async () => {
      const res = await request
        .post('/api/v1/production/quality-check')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          jobId: testJobId,
          passed: true,
          notes: 'Stitching aligned perfectly.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Quality check recorded successfully.');
    });

    it('should return job to IN_PROGRESS when quality check fails', async () => {
      const res = await request
        .post('/api/v1/production/quality-check')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          jobId: testJobId,
          passed: false,
          notes: 'Thread tension loose on item #1.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.job.status).toBe('IN_PROGRESS');
    });
  });

  describe('POST /api/v1/production/deliver', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/production/start')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });

      await request
        .post('/api/v1/production/complete')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });
    });

    it('should mark COMPLETED job as DELIVERED (ADMIN / MANAGER role)', async () => {
      const res = await request
        .post('/api/v1/production/deliver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ jobId: testJobId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.status).toBe('DELIVERED');
    });

    it('should reject delivery transition from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .post('/api/v1/production/deliver')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ jobId: testJobId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('GET /api/v1/production (Production Queue)', () => {
    it('should list jobs in production queue with filters', async () => {
      const res = await request
        .get('/api/v1/production')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobs).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });
  });
});
