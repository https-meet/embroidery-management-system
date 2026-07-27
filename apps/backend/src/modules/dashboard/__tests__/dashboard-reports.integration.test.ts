import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import dashboardRouter from '../dashboard.router';
import reportRouter from '../../report/report.router';
import { prisma } from '../../../lib/prisma';

describe('Dashboard & Reports Integration Test Suite', () => {
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let operatorToken: string;

  beforeEach(() => {
    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/dashboard', dashboardRouter);
    v1.use('/reports', reportRouter);

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
      email: 'operator@example.com',
      role: 'OPERATOR',
    });

    vi.restoreAllMocks();
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('should return dashboard summary metrics for authenticated users', async () => {
      vi.spyOn(prisma.customer, 'count').mockResolvedValue(5);
      vi.spyOn(prisma.job, 'count').mockResolvedValue(3);
      vi.spyOn(prisma.invoice, 'count').mockResolvedValue(2);
      vi.spyOn(prisma.invoice, 'aggregate').mockResolvedValue({
        _sum: { outstandingBalance: 450, grandTotal: 1000, discountAmount: 0, subtotal: 1000 },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
        _sum: { amount: 550 },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.job, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.invoice, 'findMany').mockResolvedValue([]);

      const res = await request
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalCustomers).toBe(5);
      expect(res.body.data.summary.activeJobs).toBe(3);
      expect(res.body.data.summary.pendingInvoices).toBe(2);
      expect(res.body.data.summary.outstandingBalance).toBe(450);
      expect(res.body.data.summary.totalRevenueThisMonth).toBe(550);
    });

    it('should allow OPERATOR role to view dashboard summary', async () => {
      vi.spyOn(prisma.customer, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.job, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.invoice, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.invoice, 'aggregate').mockResolvedValue({
        _sum: { outstandingBalance: null, grandTotal: null, discountAmount: null, subtotal: null },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
        _sum: { amount: null },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.job, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.invoice, 'findMany').mockResolvedValue([]);

      const res = await request
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request.get('/api/v1/dashboard/summary');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/reports/*', () => {
    beforeEach(() => {
      vi.spyOn(prisma.customer, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.customer, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.job, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.job, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.invoice, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.invoice, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.payment, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.payment, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.invoice, 'aggregate').mockResolvedValue({
        _sum: { grandTotal: 0, outstandingBalance: 0, discountAmount: 0, subtotal: 0 },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
        _sum: { amount: 0 },
        _avg: {},
        _count: {},
        _min: {},
        _max: {},
      });
      vi.spyOn(prisma.payment, 'groupBy').mockResolvedValue([]);
    });

    it('should return customer report (ADMIN role)', async () => {
      const res = await request
        .get('/api/v1/reports/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.total).toBe(0);
    });

    it('should return job report with date range filtering', async () => {
      const res = await request
        .get(
          '/api/v1/reports/jobs?startDate=2026-01-01T00:00:00.000Z&endDate=2026-12-31T23:59:59.999Z',
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
    });

    it('should return production report', async () => {
      const res = await request
        .get('/api/v1/reports/production')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return invoice report', async () => {
      const res = await request
        .get('/api/v1/reports/invoices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return payment report', async () => {
      const res = await request
        .get('/api/v1/reports/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return revenue report with payment method aggregation', async () => {
      const res = await request
        .get('/api/v1/reports/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalInvoiced).toBe(0);
      expect(res.body.data.totalCollected).toBe(0);
    });

    it('should reject reports endpoint for OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .get('/api/v1/reports/revenue')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});
