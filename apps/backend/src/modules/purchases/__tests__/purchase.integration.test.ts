import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import purchaseRouter from '../purchase.router';
import { purchaseRepository } from '../purchase.repository';
import { supplierRepository } from '../../suppliers/supplier.repository';
import { materialRepository } from '../../materials/material.repository';
import { settingsService } from '../../settings/settings.service';
import { jwtService } from '../../auth/jwt.service';
import { documentSequenceService } from '../../sequence/document-sequence.service';
import { prisma } from '../../../lib/prisma';

describe('Milestone 7.2 - Purchase Management Module Integration Test Suite', () => {
  let app: express.Application;
  let request: ReturnType<typeof supertest>;

  const adminToken = jwtService.generateAccessToken({
    id: 'a0000000-0000-4000-a000-000000000001',
    email: 'admin@ebms.local',
    role: 'ADMIN',
  });

  const operatorToken = jwtService.generateAccessToken({
    id: 'a0000000-0000-4000-a000-000000000002',
    email: 'operator@ebms.local',
    role: 'OPERATOR',
  });

  const mockSupplier = {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Madeira India Threads Ltd',
    isActive: true,
  };

  const mockMaterial1 = {
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Madeira Thread White #40',
    currentStock: 10,
  };

  const mockMaterial2 = {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Cut-Away Backing Roll 80gsm',
    currentStock: 5,
  };

  const purchasesDb = new Map<string, any>();
  let seqCounter = 1;

  beforeEach(() => {
    purchasesDb.clear();
    seqCounter = 1;
    mockMaterial1.currentStock = 10;
    mockMaterial2.currentStock = 5;

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
      if (id === mockSupplier.id) return mockSupplier as any;
      return null;
    };

    materialRepository.findById = async (id: string) => {
      if (id === mockMaterial1.id) return mockMaterial1 as any;
      if (id === mockMaterial2.id) return mockMaterial2 as any;
      return null;
    };

    documentSequenceService.generateNextNumber = async (docType: any) => {
      const year = new Date().getFullYear();
      return `${docType}-${year}-${String(seqCounter++).padStart(6, '0')}`;
    };

    prisma.$transaction = (async (cb: any) => {
      const mockTx = {
        purchase: {
          create: async (args: any) => {
            const id = `pur-${purchasesDb.size + 1}`;
            const purchase = {
              id,
              purchaseNumber: args.data.purchaseNumber,
              supplierId: args.data.supplierId,
              supplier: mockSupplier,
              purchaseDate: args.data.purchaseDate || new Date(),
              invoiceNumber: args.data.invoiceNumber || null,
              invoiceDate: args.data.invoiceDate || null,
              subtotal: args.data.subtotal,
              discount: args.data.discount,
              tax: args.data.tax,
              total: args.data.total,
              notes: args.data.notes || null,
              inventoryUpdated: args.data.inventoryUpdated,
              createdBy: args.data.createdBy,
              createdAt: new Date(),
              updatedAt: new Date(),
              items: args.data.items.create.map((item: any, idx: number) => ({
                id: `item-${idx + 1}`,
                purchaseId: id,
                materialId: item.materialId,
                material: item.materialId === mockMaterial1.id ? mockMaterial1 : mockMaterial2,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
              })),
            };
            purchasesDb.set(id, purchase);
            return purchase;
          },
          update: async (args: any) => {
            const existing = purchasesDb.get(args.where.id);
            const updated = { ...existing, ...args.data, updatedAt: new Date() };
            purchasesDb.set(args.where.id, updated);
            return updated;
          },
        },
        material: {
          update: async (args: any) => {
            if (args.where.id === mockMaterial1.id) {
              mockMaterial1.currentStock += args.data.currentStock.increment;
              return mockMaterial1;
            }
            if (args.where.id === mockMaterial2.id) {
              mockMaterial2.currentStock += args.data.currentStock.increment;
              return mockMaterial2;
            }
          },
        },
        purchaseItem: {
          deleteMany: async () => ({ count: 0 }),
        },
      };
      return cb(mockTx);
    }) as any;

    purchaseRepository.findById = async (id: string) => {
      return purchasesDb.get(id) || null;
    };

    purchaseRepository.findMany = async (filter: any) => {
      const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
      const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
      const skip = (page - 1) * limit;

      let list = Array.from(purchasesDb.values());

      if (filter.supplierId) {
        list = list.filter((p) => p.supplierId === filter.supplierId);
      }

      if (filter.inventoryUpdated !== undefined && filter.inventoryUpdated !== '') {
        const boolVal = filter.inventoryUpdated === 'true' || filter.inventoryUpdated === true;
        list = list.filter((p) => p.inventoryUpdated === boolVal);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.purchaseNumber.toLowerCase().includes(searchLower) ||
            (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchLower)) ||
            (p.notes && p.notes.toLowerCase().includes(searchLower)) ||
            (p.supplier && p.supplier.name.toLowerCase().includes(searchLower)),
        );
      }

      const total = list.length;
      const paginated = list.slice(skip, skip + limit);

      return { purchases: paginated as any, total };
    };

    app = express();
    app.use(express.json());
    app.use('/api/v1/purchases', purchaseRouter);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('1. POST /api/v1/purchases (Create Purchase & Optional Inventory Update)', () => {
    it('should create purchase with sequence number, calculate line totals, and return purchase DTO', async () => {
      const res = await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: mockSupplier.id,
          invoiceNumber: 'INV-SUP-9001',
          discount: 50,
          tax: 100,
          notes: 'Batch thread order',
          updateInventory: false,
          items: [
            {
              materialId: mockMaterial1.id,
              quantity: 10,
              unitPrice: 450,
            },
            {
              materialId: mockMaterial2.id,
              quantity: 2,
              unitPrice: 1200,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const p = res.body.data.purchase;
      expect(p.purchaseNumber).toMatch(/^PUR-\d{4}-\d{6}$/);
      expect(p.subtotal).toBe(6900); // (10*450) + (2*1200) = 4500 + 2400 = 6900
      expect(p.discount).toBe(50);
      expect(p.tax).toBe(100);
      expect(p.total).toBe(6950); // 6900 - 50 + 100
      expect(p.inventoryUpdated).toBe(false);
      expect(p.items).toHaveLength(2);
      expect(mockMaterial1.currentStock).toBe(10); // Unchanged when updateInventory = false
    });

    it('should increment material currentStock when updateInventory is true', async () => {
      const res = await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: mockSupplier.id,
          updateInventory: true,
          items: [
            {
              materialId: mockMaterial1.id,
              quantity: 25,
              unitPrice: 450,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.purchase.inventoryUpdated).toBe(true);
      expect(mockMaterial1.currentStock).toBe(35); // 10 + 25 = 35
    });

    it('should reject OPERATOR creation attempts with 403 Forbidden', async () => {
      const res = await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          supplierId: mockSupplier.id,
          items: [{ materialId: mockMaterial1.id, quantity: 1, unitPrice: 100 }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should reject purchase with invalid non-existent supplier ID', async () => {
      const res = await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: '99999999-9999-4999-a999-999999999999',
          items: [{ materialId: mockMaterial1.id, quantity: 1, unitPrice: 100 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SUPPLIER_NOT_FOUND');
    });

    it('should reject purchase with zero or negative item quantity', async () => {
      const res = await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: mockSupplier.id,
          items: [{ materialId: mockMaterial1.id, quantity: 0, unitPrice: 100 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('2. GET /api/v1/purchases & Search / Pagination', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: mockSupplier.id,
          invoiceNumber: 'INV-THREAD-101',
          notes: 'Special thread order',
          items: [{ materialId: mockMaterial1.id, quantity: 5, unitPrice: 400 }],
        });
    });

    it('should allow OPERATOR to list purchases with pagination metadata', async () => {
      const res = await request
        .get('/api/v1/purchases')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.purchases).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should search purchases across purchaseNumber, invoiceNumber, and notes', async () => {
      const res = await request
        .get('/api/v1/purchases?search=THREAD-101')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.purchases).toHaveLength(1);
      expect(res.body.data.purchases[0].invoiceNumber).toBe('INV-THREAD-101');
    });
  });
});
