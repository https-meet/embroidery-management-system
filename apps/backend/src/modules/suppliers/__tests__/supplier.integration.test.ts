import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import supplierRouter from '../supplier.router';
import { supplierRepository } from '../supplier.repository';
import { settingsService } from '../../settings/settings.service';
import { jwtService } from '../../auth/jwt.service';

describe('Milestone 7.1 - Supplier Management Module Integration Test Suite', () => {
  let app: express.Application;
  let request: ReturnType<typeof supertest>;

  const adminToken = jwtService.generateAccessToken({
    id: 'admin-uuid-1',
    email: 'admin@ebms.local',
    role: 'ADMIN',
  });

  const operatorToken = jwtService.generateAccessToken({
    id: 'operator-uuid-1',
    email: 'operator@ebms.local',
    role: 'OPERATOR',
  });

  const suppliersDb = new Map<string, any>();

  beforeEach(() => {
    suppliersDb.clear();

    settingsService.logAuditAction = async (entry: any) => ({
      id: 'mock-audit-id',
      userId: entry.userId || null,
      userName: entry.userName,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId || null,
      previousValue: entry.previousValue || null,
      newValue: entry.newValue || null,
      reason: entry.reason || null,
      timestamp: new Date(),
    });

    supplierRepository.findById = async (id: string) => {
      return suppliersDb.get(id) || null;
    };

    supplierRepository.findByName = async (name: string) => {
      for (const s of suppliersDb.values()) {
        if (s.name.toLowerCase() === name.toLowerCase()) return s;
      }
      return null;
    };

    supplierRepository.create = async (data: any) => {
      const id = `sup-${suppliersDb.size + 1}`;
      const now = new Date();
      const supplier = {
        id,
        name: data.name,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        gstNumber: data.gstNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || 'India',
        postalCode: data.postalCode || null,
        notes: data.notes || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      suppliersDb.set(id, supplier);
      return supplier as any;
    };

    supplierRepository.update = async (id: string, data: any) => {
      const existing = suppliersDb.get(id);
      if (!existing) throw new Error('Supplier not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      suppliersDb.set(id, updated);
      return updated as any;
    };

    supplierRepository.updateStatus = async (id: string, isActive: boolean) => {
      const existing = suppliersDb.get(id);
      if (!existing) throw new Error('Supplier not found');
      const updated = { ...existing, isActive, updatedAt: new Date() };
      suppliersDb.set(id, updated);
      return updated as any;
    };

    supplierRepository.findMany = async (filter: any) => {
      const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
      const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
      const skip = (page - 1) * limit;

      let list = Array.from(suppliersDb.values());

      if (filter.active !== undefined && filter.active !== '') {
        const isActiveBool = filter.active === 'true' || filter.active === true;
        list = list.filter((s) => s.isActive === isActiveBool);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase().trim();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            (s.contactPerson && s.contactPerson.toLowerCase().includes(searchLower)) ||
            (s.phone && s.phone.toLowerCase().includes(searchLower)) ||
            (s.email && s.email.toLowerCase().includes(searchLower)) ||
            (s.gstNumber && s.gstNumber.toLowerCase().includes(searchLower)) ||
            (s.city && s.city.toLowerCase().includes(searchLower)) ||
            (s.state && s.state.toLowerCase().includes(searchLower)),
        );
      }

      const total = list.length;
      const paginated = list.slice(skip, skip + limit);

      return { suppliers: paginated as any, total };
    };

    app = express();
    app.use(express.json());
    app.use('/api/v1/suppliers', supplierRouter);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('1. POST /api/v1/suppliers (Create Supplier & RBAC)', () => {
    it('should allow ADMIN to create supplier with complete details', async () => {
      const res = await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Madeira Thread Distributors',
          contactPerson: 'Rajesh Shah',
          phone: '+91 98250 12345',
          email: 'sales@madeira-threads.com',
          gstNumber: '24AAAAA0000A1Z5',
          address: 'Station Road',
          city: 'Surat',
          state: 'Gujarat',
          country: 'India',
          postalCode: '395003',
          notes: 'Primary thread supplier',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.supplier.id).toBeDefined();
      expect(res.body.data.supplier.name).toBe('Madeira Thread Distributors');
      expect(res.body.data.supplier.city).toBe('Surat');
      expect(res.body.data.supplier.gstNumber).toBe('24AAAAA0000A1Z5');
      expect(res.body.data.supplier.isActive).toBe(true);
    });

    it('should reject OPERATOR creation attempts with 403 Forbidden', async () => {
      const res = await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Gunold Backings India',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should reject duplicate supplier names with 400 Bad Request', async () => {
      await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Coats Threads Ltd' });

      const duplicateRes = await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'coats threads ltd' });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.error.code).toBe('SUPPLIER_NAME_EXISTS');
    });

    it('should validate invalid GST number format', async () => {
      const res = await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid GST Supplier',
          gstNumber: 'INVALID-GST-123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('gstNumber');
    });
  });

  describe('2. GET /api/v1/suppliers & Search / Pagination', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Vardhman Yarns',
          contactPerson: 'Amit Kumar',
          city: 'Ludhiana',
          state: 'Punjab',
          gstNumber: '03AAAAA0000A1Z5',
        });

      await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Organ Needle Agency',
          contactPerson: 'Suresh Patel',
          city: 'Ahmedabad',
          state: 'Gujarat',
          gstNumber: '24BBBBB1111B1Z2',
        });
    });

    it('should allow OPERATOR to list suppliers with pagination metadata', async () => {
      const res = await request
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suppliers).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('should search across name, contactPerson, and city', async () => {
      const res = await request
        .get('/api/v1/suppliers?search=Ahmedabad')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.suppliers).toHaveLength(1);
      expect(res.body.data.suppliers[0].name).toBe('Organ Needle Agency');
    });

    it('should fetch single supplier by ID', async () => {
      const listRes = await request
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${operatorToken}`);
      const supId = listRes.body.data.suppliers[0].id;

      const res = await request
        .get(`/api/v1/suppliers/${supId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.supplier.id).toBe(supId);
    });
  });

  describe('3. PATCH /api/v1/suppliers/:id & Status Toggle', () => {
    let supId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Supreme Packaging Industries',
          city: 'Mumbai',
          state: 'Maharashtra',
        });
      supId = createRes.body.data.supplier.id;
    });

    it('should update supplier details', async () => {
      const res = await request
        .patch(`/api/v1/suppliers/${supId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contactPerson: 'Vikram Mehta',
          phone: '+91 99000 88776',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.supplier.contactPerson).toBe('Vikram Mehta');
      expect(res.body.data.supplier.phone).toBe('+91 99000 88776');
    });

    it('should toggle supplier active status', async () => {
      const deactRes = await request
        .patch(`/api/v1/suppliers/${supId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.data.supplier.isActive).toBe(false);

      const reactRes = await request
        .patch(`/api/v1/suppliers/${supId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(reactRes.status).toBe(200);
      expect(reactRes.body.data.supplier.isActive).toBe(true);
    });
  });
});
