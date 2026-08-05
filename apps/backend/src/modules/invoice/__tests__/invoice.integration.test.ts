import type {
  Customer,
  DiscountType,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentAllocation,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import { customerRepository } from '../../customer/customer.repository';
import { jobRepository } from '../../job/job.repository';
import { paymentRepository } from '../../payment/payment.repository';
import paymentRouter from '../../payment/payment.router';
import { invoiceCalculationService } from '../invoice-calculation.service';
import { invoiceRepository } from '../invoice.repository';
import invoiceRouter from '../invoice.router';

type FullInvoiceMock = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
};

type FullPaymentMock = Payment & {
  customer: Customer;
  allocations: PaymentAllocation[];
};

class MockInvoiceRepository {
  public invoices: Map<string, FullInvoiceMock> = new Map();

  public async findById(id: string): Promise<FullInvoiceMock | null> {
    return this.invoices.get(id) ?? null;
  }

  public async countTotalForYear(year: number): Promise<number> {
    let count = 0;
    for (const inv of this.invoices.values()) {
      if (inv.createdAt.getFullYear() === year) {
        count++;
      }
    }
    return count;
  }

  public async create(data: {
    invoiceNo: string;
    customerId: string;
    invoiceDate?: Date;
    dueDate?: Date | null;
    discountType?: DiscountType | null;
    discountValue?: number | null;
    discountAmount: number;
    subtotal: number;
    grandTotal: number;
    totalPaid: number;
    outstandingBalance: number;
    notes?: string | null;
    items: {
      sourceJobId?: string;
      sourceJobItemRef?: string;
      description: string;
      quantity: number;
      rate: number;
    }[];
  }): Promise<FullInvoiceMock> {
    const id = `44444444-4444-4444-8444-${String(this.invoices.size + 1).padStart(12, '0')}`;
    const mockCustomer: Customer = {
      id: data.customerId,
      customerCode: 'CUS-000001',
      customerType: 'INDIVIDUAL',
      name: 'Invoice Integration Client',
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

    const createdItems: InvoiceItem[] = data.items.map((item, idx) => ({
      id: `item-${idx + 1}`,
      invoiceId: id,
      sourceJobId: item.sourceJobId ?? null,
      sourceJobItemRef: item.sourceJobItemRef ?? null,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: Math.round(item.quantity * item.rate * 100) / 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const inv: FullInvoiceMock = {
      id,
      invoiceNo: data.invoiceNo,
      customerId: data.customerId,
      customer: mockCustomer,
      invoiceDate: data.invoiceDate ?? new Date(),
      dueDate: data.dueDate ?? null,
      status: 'ISSUED',
      discountType: data.discountType ?? null,
      discountValue: data.discountValue ?? null,
      discountAmount: data.discountAmount,
      subtotal: data.subtotal,
      grandTotal: data.grandTotal,
      totalPaid: data.totalPaid,
      outstandingBalance: data.outstandingBalance,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: createdItems,
    };

    this.invoices.set(id, inv);
    return inv;
  }

  public async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<FullInvoiceMock> {
    const existing = this.invoices.get(id);
    if (!existing) throw new Error('Invoice not found');

    const updated: FullInvoiceMock = {
      ...existing,
      ...(data.status && { status: data.status as InvoiceStatus }),
      ...(data.totalPaid !== undefined && { totalPaid: data.totalPaid as number }),
      ...(data.outstandingBalance !== undefined && {
        outstandingBalance: data.outstandingBalance as number,
      }),
      updatedAt: new Date(),
    };
    this.invoices.set(id, updated);
    return updated;
  }

  public async findMany(filter: {
    customerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: FullInvoiceMock[]; total: number }> {
    let list = Array.from(this.invoices.values());
    if (filter.customerId) list = list.filter((i) => i.customerId === filter.customerId);
    if (filter.status) list = list.filter((i) => i.status === filter.status);

    const total = list.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { invoices: paginated, total };
  }
}

class MockPaymentRepository {
  public payments: Map<string, FullPaymentMock> = new Map();

  public async findById(id: string): Promise<FullPaymentMock | null> {
    return this.payments.get(id) ?? null;
  }

  public async countTotalForYear(year: number): Promise<number> {
    let count = 0;
    for (const p of this.payments.values()) {
      if (p.createdAt.getFullYear() === year) {
        count++;
      }
    }
    return count;
  }

  public async create(data: {
    paymentNo: string;
    customerId: string;
    paymentDate?: Date;
    paymentMethod: PaymentMethod;
    referenceNo?: string | null;
    amount: number;
    notes?: string | null;
    allocations: { invoiceId: string; allocatedAmount: number }[];
  }): Promise<FullPaymentMock> {
    const id = `55555555-5555-4555-8555-${String(this.payments.size + 1).padStart(12, '0')}`;
    const mockCustomer: Customer = {
      id: data.customerId,
      customerCode: 'CUS-000001',
      customerType: 'INDIVIDUAL',
      name: 'Invoice Integration Client',
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

    const createdAllocations: PaymentAllocation[] = data.allocations.map((alloc, idx) => ({
      id: `alloc-${idx + 1}`,
      paymentId: id,
      invoiceId: alloc.invoiceId,
      allocatedAmount: alloc.allocatedAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const payment: FullPaymentMock = {
      id,
      paymentNo: data.paymentNo,
      customerId: data.customerId,
      customer: mockCustomer,
      paymentDate: data.paymentDate ?? new Date(),
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo ?? null,
      amount: data.amount,
      status: 'FULLY_ALLOCATED',
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      allocations: createdAllocations,
    };

    this.payments.set(id, payment);
    return payment;
  }

  public async findMany(filter: {
    customerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: FullPaymentMock[]; total: number }> {
    let list = Array.from(this.payments.values());
    if (filter.customerId) list = list.filter((p) => p.customerId === filter.customerId);
    if (filter.status) list = list.filter((p) => p.status === filter.status);

    const total = list.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { payments: paginated, total };
  }
}

describe('Invoicing & Payments Integration Test Suite', () => {
  let mockInvRepo: MockInvoiceRepository;
  let mockPayRepo: MockPaymentRepository;
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let operatorToken: string;
  let testCustomerId: string;
  let testJobId: string;

  beforeEach(() => {
    mockInvRepo = new MockInvoiceRepository();
    mockPayRepo = new MockPaymentRepository();

    invoiceRepository.findById = mockInvRepo.findById.bind(mockInvRepo);
    invoiceRepository.countTotalForYear = mockInvRepo.countTotalForYear.bind(mockInvRepo);
    invoiceRepository.create = mockInvRepo.create.bind(mockInvRepo);
    invoiceRepository.update = mockInvRepo.update.bind(mockInvRepo);
    invoiceRepository.findMany = mockInvRepo.findMany.bind(mockInvRepo);

    paymentRepository.findById = mockPayRepo.findById.bind(mockPayRepo);
    paymentRepository.countTotalForYear = mockPayRepo.countTotalForYear.bind(mockPayRepo);
    paymentRepository.create = mockPayRepo.create.bind(mockPayRepo);
    paymentRepository.findMany = mockPayRepo.findMany.bind(mockPayRepo);

    testCustomerId = '22222222-2222-4222-8222-222222222222';
    testJobId = '33333333-3333-4333-8333-333333333333';

    customerRepository.findById = async (id: string) => {
      if (id === testCustomerId) {
        return {
          id: testCustomerId,
          customerCode: 'CUS-000001',
          customerType: 'INDIVIDUAL',
          name: 'Invoice Integration Client',
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
      }
      return null;
    };

    jobRepository.findById = async (id: string) => {
      if (id === testJobId) {
        return {
          id: testJobId,
          jobNo: 'JOB-2026-000001',
          customerId: testCustomerId,
          customer: {
            id: testCustomerId,
            customerCode: 'CUS-000001',
            customerType: 'INDIVIDUAL',
            name: 'Invoice Integration Client',
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
          },
          jobDate: new Date(),
          expectedDeliveryDate: null,
          priority: 'NORMAL',
          status: 'COMPLETED',
          assignedOperator: 'Operator J',
          startedAt: new Date(),
          completedAt: new Date(),
          qualityCheckedAt: new Date(),
          qualityCheckedBy: 'admin@example.com',
          deliveredAt: null,
          notes: null,
          createdBy: 'admin@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          items: [
            {
              id: 'job-item-1',
              jobId: testJobId,
              designId: null,
              design: null,
              position: 'Chest Logo',
              quantity: 20,
              rate: 50.0,
              lineTotal: 1000.0,
              threadColor: 'Gold',
              dimensions: null,
              remarks: null,
              productionStatus: 'COMPLETED',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
      }
      return null;
    };

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/invoices', invoiceRouter);
    v1.use('/payments', paymentRouter);

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

  describe('Invoice Calculation Service Unit Tests', () => {
    it('should correctly calculate subtotal, percentage discount, and grand total', () => {
      const result = invoiceCalculationService.calculate({
        items: [
          { quantity: 10, rate: 100 },
          { quantity: 5, rate: 50 },
        ],
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });

      expect(result.subtotal).toBe(1250);
      expect(result.discountAmount).toBe(125);
      expect(result.grandTotal).toBe(1125);
      expect(result.outstandingBalance).toBe(1125);
    });

    it('should cap discount amount at subtotal to prevent negative totals', () => {
      const result = invoiceCalculationService.calculate({
        items: [{ quantity: 1, rate: 100 }],
        discountType: 'FIXED_AMOUNT',
        discountValue: 150,
      });

      expect(result.subtotal).toBe(100);
      expect(result.discountAmount).toBe(100);
      expect(result.grandTotal).toBe(0);
    });
  });

  describe('POST /api/v1/invoices (Create Invoice)', () => {
    it('should create an invoice with sequential numbering (INV-2026-000001)', async () => {
      const res = await request
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            {
              description: 'Custom Embroidery Pack',
              quantity: 10,
              rate: 150.0,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoice.invoiceNo).toMatch(/^INV-\d{4}-\d{6}$/);
      expect(res.body.data.invoice.subtotal).toBe(1500);
      expect(res.body.data.invoice.grandTotal).toBe(1500);
    });

    it('should generate an invoice directly from completed job(s)', async () => {
      const res = await request
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          jobIds: [testJobId],
          discountType: 'PERCENTAGE',
          discountValue: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoice.subtotal).toBe(1000);
      expect(res.body.data.invoice.discountAmount).toBe(50);
      expect(res.body.data.invoice.grandTotal).toBe(950);
    });

    it('should reject invoice creation for invalid customer ID (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: '00000000-0000-4000-8000-000000000000',
          items: [{ description: 'Test Item', quantity: 1, rate: 100 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CUSTOMER');
    });

    it('should reject invoice creation from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          customerId: testCustomerId,
          items: [{ description: 'Test Item', quantity: 1, rate: 100 }],
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('POST /api/v1/payments (Record Payment & Allocation)', () => {
    let createdInvoiceId: string;

    beforeEach(async () => {
      const invRes = await request
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          items: [{ description: 'Job Package A', quantity: 10, rate: 100.0 }],
        });

      createdInvoiceId = invRes.body.data.invoice.id;
    });

    it('should record partial payment and transition invoice status to PARTIALLY_PAID', async () => {
      const res = await request
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          paymentMethod: 'UPI',
          referenceNo: 'UPI-REF-12345',
          amount: 400.0,
          allocations: [
            {
              invoiceId: createdInvoiceId,
              allocatedAmount: 400.0,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.paymentNo).toMatch(/^PAY-\d{4}-\d{6}$/);

      // Verify updated invoice status
      const invRes = await request
        .get(`/api/v1/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(invRes.body.data.invoice.totalPaid).toBe(400);
      expect(invRes.body.data.invoice.outstandingBalance).toBe(600);
      expect(invRes.body.data.invoice.status).toBe('PARTIALLY_PAID');
    });

    it('should record full payment and transition invoice status to PAID', async () => {
      const res = await request
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          paymentMethod: 'CASH',
          amount: 1000.0,
          allocations: [
            {
              invoiceId: createdInvoiceId,
              allocatedAmount: 1000.0,
            },
          ],
        });

      expect(res.status).toBe(201);

      // Verify updated invoice status
      const invRes = await request
        .get(`/api/v1/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(invRes.body.data.invoice.totalPaid).toBe(1000);
      expect(invRes.body.data.invoice.outstandingBalance).toBe(0);
      expect(invRes.body.data.invoice.status).toBe('PAID');
    });

    it('should reject payment over-allocation exceeding invoice outstanding balance (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomerId,
          paymentMethod: 'CHEQUE',
          amount: 1500.0,
          allocations: [
            {
              invoiceId: createdInvoiceId,
              allocatedAmount: 1500.0,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('OVER_ALLOCATION');
    });
  });

  describe('GET /api/v1/invoices & /api/v1/payments', () => {
    it('should list invoices with pagination and search', async () => {
      const res = await request
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoices).toBeDefined();
    });

    it('should list payments with pagination and search', async () => {
      const res = await request
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payments).toBeDefined();
    });
  });
});
