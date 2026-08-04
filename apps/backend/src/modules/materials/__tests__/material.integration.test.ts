import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import materialRouter from '../material.router';
import { materialRepository } from '../material.repository';
import { materialService } from '../material.service';
import { settingsService } from '../../settings/settings.service';
import { jwtService } from '../../auth/jwt.service';

describe('Milestone 7.0 (Sprint 1) - Material Master Module Integration Test Suite', () => {
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

  const materialsDb = new Map<string, any>();

  beforeEach(() => {
    materialsDb.clear();

    // Mock Audit Action to avoid Prisma DB connection timeout in mock test
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

    // Mock Repository Methods for Unit/Integration Testing
    materialRepository.findById = async (id: string) => {
      return materialsDb.get(id) || null;
    };

    materialRepository.findByName = async (name: string) => {
      for (const m of materialsDb.values()) {
        if (m.name.toLowerCase() === name.toLowerCase()) return m;
      }
      return null;
    };

    materialRepository.findBySku = async (sku: string) => {
      for (const m of materialsDb.values()) {
        if (m.sku && m.sku.toLowerCase() === sku.toLowerCase()) return m;
      }
      return null;
    };

    materialRepository.create = async (data: any) => {
      const id = `mat-${materialsDb.size + 1}`;
      const now = new Date();
      const material = {
        id,
        name: data.name,
        sku: data.sku || null,
        brand: data.brand || null,
        colorName: data.colorName || null,
        colorCode: data.colorCode || null,
        category: data.category || 'OTHER',
        unit: data.unit || 'PCS',
        purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : 0,
        sellingPrice: data.sellingPrice ?? null,
        minimumStock: data.minimumStock ?? 0,
        currentStock: data.currentStock ?? 0,
        description: data.description || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      materialsDb.set(id, material);
      return material as any;
    };

    materialRepository.update = async (id: string, data: any) => {
      const existing = materialsDb.get(id);
      if (!existing) throw new Error('Material not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      materialsDb.set(id, updated);
      return updated as any;
    };

    materialRepository.updateStatus = async (id: string, isActive: boolean) => {
      const existing = materialsDb.get(id);
      if (!existing) throw new Error('Material not found');
      const updated = { ...existing, isActive, updatedAt: new Date() };
      materialsDb.set(id, updated);
      return updated as any;
    };

    materialRepository.findMany = async (filter: any) => {
      const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
      const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
      const skip = (page - 1) * limit;

      let list = Array.from(materialsDb.values());

      if (filter.active !== undefined && filter.active !== '') {
        const isActiveBool = filter.active === 'true' || filter.active === true;
        list = list.filter((m) => m.isActive === isActiveBool);
      }

      if (filter.category) {
        list = list.filter((m) => m.category === filter.category);
      }

      if (filter.brand) {
        list = list.filter((m) => m.brand && m.brand.toLowerCase().includes(filter.brand.toLowerCase()));
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase().trim();
        list = list.filter(
          (m) =>
            m.name.toLowerCase().includes(searchLower) ||
            (m.sku && m.sku.toLowerCase().includes(searchLower)) ||
            (m.brand && m.brand.toLowerCase().includes(searchLower)) ||
            (m.colorName && m.colorName.toLowerCase().includes(searchLower)) ||
            (m.description && m.description.toLowerCase().includes(searchLower)),
        );
      }

      const total = list.length;
      const paginated = list.slice(skip, skip + limit);

      return { materials: paginated as any, total };
    };

    app = express();
    app.use(express.json());
    app.use('/api/v1/materials', materialRouter);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('1. POST /api/v1/materials (Create Material & RBAC)', () => {
    it('should allow ADMIN to create material with brand, color, category, unit, purchasePrice, and currentStock', async () => {
      const res = await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Madeira Rayon Thread #40 - Black',
          sku: 'TH-MAD-BLK-40',
          brand: 'Madeira',
          colorName: 'Black',
          colorCode: '1000',
          category: 'THREAD',
          unit: 'CONE',
          purchasePrice: 450.50,
          sellingPrice: 600.00,
          minimumStock: 5,
          currentStock: 25,
          description: 'High-grade embroidery thread cone 5000m',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.material.id).toBeDefined();
      expect(res.body.data.material.name).toBe('Madeira Rayon Thread #40 - Black');
      expect(res.body.data.material.category).toBe('THREAD');
      expect(res.body.data.material.unit).toBe('CONE');
      expect(res.body.data.material.purchasePrice).toBe(450.50);
      expect(res.body.data.material.isActive).toBe(true);
    });

    it('should reject OPERATOR creation attempts with 403 Forbidden', async () => {
      const res = await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Tear-Away Backing Roll 80gsm',
          category: 'BACKING',
          unit: 'ROLL',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should reject duplicate material names with 400 Bad Request', async () => {
      await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Duplicate Thread', category: 'THREAD' });

      const duplicateRes = await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'duplicate thread', category: 'THREAD' });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.error.code).toBe('MATERIAL_NAME_EXISTS');
    });

    it('should allow duplicate SKU but include skuWarning in response', async () => {
      await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Material One', sku: 'SKU-100' });

      const res = await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Material Two', sku: 'SKU-100' });

      expect(res.status).toBe(201);
      expect(res.body.data.skuWarning).toBeDefined();
      expect(res.body.data.skuWarning).toContain('SKU-100');
    });
  });

  describe('2. GET /api/v1/materials & GET /api/v1/materials/:id', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Organ Needles 75/11',
          sku: 'NDL-ORG-75',
          brand: 'Organ',
          category: 'NEEDLE',
          unit: 'BOX',
          purchasePrice: 250,
          minimumStock: 10,
          currentStock: 50,
        });

      await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cut-Away Backing Roll 100gsm',
          sku: 'BCK-CUT-100',
          brand: 'Gunold',
          category: 'BACKING',
          unit: 'ROLL',
          purchasePrice: 1200,
          minimumStock: 2,
          currentStock: 8,
        });
    });

    it('should allow OPERATOR to list materials with pagination metadata', async () => {
      const res = await request
        .get('/api/v1/materials')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.materials).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    it('should search materials across name, sku, and brand', async () => {
      const res = await request
        .get('/api/v1/materials?search=Gunold')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.materials).toHaveLength(1);
      expect(res.body.data.materials[0].name).toBe('Cut-Away Backing Roll 100gsm');
    });

    it('should filter materials by category', async () => {
      const res = await request
        .get('/api/v1/materials?category=NEEDLE')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.materials).toHaveLength(1);
      expect(res.body.data.materials[0].category).toBe('NEEDLE');
    });

    it('should fetch single material by ID', async () => {
      const listRes = await request
        .get('/api/v1/materials')
        .set('Authorization', `Bearer ${operatorToken}`);
      const matId = listRes.body.data.materials[0].id;

      const res = await request
        .get(`/api/v1/materials/${matId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.material.id).toBe(matId);
    });
  });

  describe('3. PATCH /api/v1/materials/:id & Status Toggle', () => {
    let matId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Polybags 10x12 Inch',
          sku: 'PKG-BAG-1012',
          category: 'PACKAGING',
          unit: 'PACKET',
          purchasePrice: 150,
          currentStock: 100,
        });
      matId = createRes.body.data.material.id;
    });

    it('should update material details', async () => {
      const res = await request
        .patch(`/api/v1/materials/${matId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Polybags 10x12 Inch (Clear Heavy Duty)',
          purchasePrice: 175,
          currentStock: 120,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.material.name).toBe('Polybags 10x12 Inch (Clear Heavy Duty)');
      expect(res.body.data.material.purchasePrice).toBe(175);
      expect(res.body.data.material.currentStock).toBe(120);
    });

    it('should deactivate and reactivate material status via status endpoint', async () => {
      const deactRes = await request
        .patch(`/api/v1/materials/${matId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.data.material.isActive).toBe(false);

      const reactRes = await request
        .patch(`/api/v1/materials/${matId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(reactRes.status).toBe(200);
      expect(reactRes.body.data.material.isActive).toBe(true);
    });
  });
});
