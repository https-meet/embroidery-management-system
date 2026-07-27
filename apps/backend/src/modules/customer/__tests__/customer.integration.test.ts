import type { Customer, CustomerType } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import { customerRepository } from '../customer.repository';
import customerRouter from '../customer.router';

class MockCustomerRepository {
  public customers: Map<string, Customer> = new Map();

  public async findById(id: string): Promise<Customer | null> {
    const c = this.customers.get(id);
    if (!c || c.deletedAt !== null) return null;
    return c;
  }

  public async findByCode(code: string): Promise<Customer | null> {
    for (const c of this.customers.values()) {
      if (c.customerCode === code && c.deletedAt === null) return c;
    }
    return null;
  }

  public async findByNameAndMobile(name: string, mobile: string): Promise<Customer | null> {
    for (const c of this.customers.values()) {
      if (
        c.deletedAt === null &&
        c.name.toLowerCase() === name.toLowerCase() &&
        c.mobile === mobile
      ) {
        return c;
      }
    }
    return null;
  }

  public async countTotal(): Promise<number> {
    return this.customers.size;
  }

  public async create(data: {
    customerCode: string;
    name: string;
    customerType?: CustomerType;
    contactPerson?: string;
    mobile?: string;
    alternateMobile?: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Promise<Customer> {
    const customer: Customer = {
      id: `uuid-cus-${Date.now()}-${Math.random()}`,
      customerCode: data.customerCode,
      customerType: data.customerType ?? 'INDIVIDUAL',
      name: data.name,
      contactPerson: data.contactPerson ?? null,
      mobile: data.mobile ?? null,
      alternateMobile: data.alternateMobile ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  public async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) throw new Error('Customer not found');
    const updated: Customer = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.customers.set(id, updated);
    return updated;
  }

  public async archive(id: string): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) throw new Error('Customer not found');
    const archived: Customer = {
      ...existing,
      deletedAt: new Date(),
      isActive: false,
    };
    this.customers.set(id, archived);
    return archived;
  }

  public async findMany(filter: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    let list = Array.from(this.customers.values()).filter((c) => c.deletedAt === null);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.customerCode.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
          (c.mobile && c.mobile.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)),
      );
    }

    const total = list.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { customers: paginated, total };
  }
}

describe('Customer Management Integration Test Suite', () => {
  let mockRepo: MockCustomerRepository;
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let operatorToken: string;

  beforeEach(() => {
    mockRepo = new MockCustomerRepository();

    customerRepository.findById = mockRepo.findById.bind(mockRepo);
    customerRepository.findByCode = mockRepo.findByCode.bind(mockRepo);
    customerRepository.findByNameAndMobile = mockRepo.findByNameAndMobile.bind(mockRepo);
    customerRepository.countTotal = mockRepo.countTotal.bind(mockRepo);
    customerRepository.create = mockRepo.create.bind(mockRepo);
    customerRepository.update = mockRepo.update.bind(mockRepo);
    customerRepository.archive = mockRepo.archive.bind(mockRepo);
    customerRepository.findMany = mockRepo.findMany.bind(mockRepo);

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/customers', customerRouter);

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

  describe('POST /api/v1/customers', () => {
    it('should create a customer with sequential code CUS-000001', async () => {
      const res = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Acme Embroidery',
          customerType: 'COMPANY',
          mobile: '9876543210',
          email: 'info@acme.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.customerCode).toBe('CUS-000001');
      expect(res.body.data.customer.name).toBe('Acme Embroidery');
    });

    it('should generate sequential customer codes CUS-000002 for second customer', async () => {
      await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'First Customer' });

      const res2 = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Second Customer' });

      expect(res2.status).toBe(201);
      expect(res2.body.data.customer.customerCode).toBe('CUS-000002');
    });

    it('should reject creation with duplicate name and mobile number (409 Conflict)', async () => {
      await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Name', mobile: '9998887770' });

      const dupRes = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'unique name', mobile: '9998887770' });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.error.code).toBe('DUPLICATE_CUSTOMER');
    });

    it('should reject creation with missing required name (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ customerType: 'INDIVIDUAL' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject unauthorized creation request (401 Unauthorized)', async () => {
      const res = await request.post('/api/v1/customers').send({ name: 'Unauthorized Customer' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/customers & Search/Pagination', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Alpha Traders', mobile: '1111111111' });

      await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Beta Garments', mobile: '2222222222' });
    });

    it('should list all active customers with pagination metadata', async () => {
      const res = await request
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customers).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    it('should perform case-insensitive search by name', async () => {
      const res = await request
        .get('/api/v1/customers?search=alpha')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.customers).toHaveLength(1);
      expect(res.body.data.customers[0].name).toBe('Alpha Traders');
    });
  });

  describe('GET /api/v1/customers/:id & PUT /api/v1/customers/:id', () => {
    let customerId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update Target', mobile: '5555555555' });

      customerId = createRes.body.data.customer.id;
    });

    it('should get customer details by ID', async () => {
      const res = await request
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.customer.id).toBe(customerId);
    });

    it('should return 404 for non-existent customer ID', async () => {
      const res = await request
        .get('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
    });

    it('should update customer details (ADMIN role)', async () => {
      const res = await request
        .put(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Target Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.customer.name).toBe('Updated Target Name');
    });

    it('should reject update attempt from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .put(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('DELETE /api/v1/customers/:id (Archive)', () => {
    let customerId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Archive Target' });

      customerId = createRes.body.data.customer.id;
    });

    it('should archive customer (ADMIN role)', async () => {
      const res = await request
        .delete(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Customer archived successfully.');

      // Verify archived customer is no longer retrievable
      const getRes = await request
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should reject archive attempt from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .delete(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});
