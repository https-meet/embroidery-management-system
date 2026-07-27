import type { Design } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { jwtService } from '../../auth/jwt.service';
import { designRepository } from '../design.repository';
import designRouter from '../design.router';

class MockDesignRepository {
  public designs: Map<string, Design> = new Map();

  public async findById(id: string): Promise<Design | null> {
    const d = this.designs.get(id);
    if (!d || d.deletedAt !== null) return null;
    return d;
  }

  public async findByCode(code: string): Promise<Design | null> {
    for (const d of this.designs.values()) {
      if (d.designCode === code && d.deletedAt === null) return d;
    }
    return null;
  }

  public async findByName(name: string): Promise<Design | null> {
    for (const d of this.designs.values()) {
      if (d.deletedAt === null && d.name.toLowerCase() === name.toLowerCase()) {
        return d;
      }
    }
    return null;
  }

  public async countTotalForYear(year: number): Promise<number> {
    let count = 0;
    for (const d of this.designs.values()) {
      if (d.createdAt.getFullYear() === year) {
        count++;
      }
    }
    return count;
  }

  public async create(data: {
    designCode: string;
    name: string;
    description?: string;
    category?: string;
    previewUrl?: string;
    primaryFileUrl?: string;
    primaryFileType?: string;
    stitchCount?: number;
    widthMm?: number;
    heightMm?: number;
    colorCount?: number;
    notes?: string;
  }): Promise<Design> {
    const design: Design = {
      id: `uuid-des-${Date.now()}-${Math.random()}`,
      designCode: data.designCode,
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? null,
      previewUrl: data.previewUrl ?? null,
      primaryFileUrl: data.primaryFileUrl ?? null,
      primaryFileType: data.primaryFileType ?? null,
      stitchCount: data.stitchCount ?? null,
      widthMm: data.widthMm ?? null,
      heightMm: data.heightMm ?? null,
      colorCount: data.colorCount ?? null,
      notes: data.notes ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.designs.set(design.id, design);
    return design;
  }

  public async update(id: string, data: Partial<Design>): Promise<Design> {
    const existing = this.designs.get(id);
    if (!existing) throw new Error('Design not found');
    const updated: Design = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.designs.set(id, updated);
    return updated;
  }

  public async archive(id: string): Promise<Design> {
    const existing = this.designs.get(id);
    if (!existing) throw new Error('Design not found');
    const archived: Design = {
      ...existing,
      deletedAt: new Date(),
      isActive: false,
    };
    this.designs.set(id, archived);
    return archived;
  }

  public async findMany(filter: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ designs: Design[]; total: number }> {
    let list = Array.from(this.designs.values()).filter((d) => d.deletedAt === null);

    if (filter.category) {
      const cat = filter.category.toLowerCase();
      list = list.filter((d) => d.category && d.category.toLowerCase() === cat);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.designCode.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q)),
      );
    }

    const total = list.length;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { designs: paginated, total };
  }
}

describe('Design Catalog Integration Test Suite', () => {
  let mockRepo: MockDesignRepository;
  let request: ReturnType<typeof supertest>;
  let adminToken: string;
  let operatorToken: string;

  beforeEach(() => {
    mockRepo = new MockDesignRepository();

    designRepository.findById = mockRepo.findById.bind(mockRepo);
    designRepository.findByCode = mockRepo.findByCode.bind(mockRepo);
    designRepository.findByName = mockRepo.findByName.bind(mockRepo);
    designRepository.countTotalForYear = mockRepo.countTotalForYear.bind(mockRepo);
    designRepository.create = mockRepo.create.bind(mockRepo);
    designRepository.update = mockRepo.update.bind(mockRepo);
    designRepository.archive = mockRepo.archive.bind(mockRepo);
    designRepository.findMany = mockRepo.findMany.bind(mockRepo);

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/designs', designRouter);

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

  describe('POST /api/v1/designs', () => {
    it('should create a design with sequential code DES-YYYY-000001', async () => {
      const currentYear = new Date().getFullYear();
      const res = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Floral Crest',
          category: 'Logos',
          primaryFileType: 'DST',
          stitchCount: 12500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.design.designCode).toBe(`DES-${currentYear}-000001`);
      expect(res.body.data.design.name).toBe('Floral Crest');
      expect(res.body.data.design.stitchCount).toBe(12500);
    });

    it('should generate sequential code DES-YYYY-000002 for second design', async () => {
      const currentYear = new Date().getFullYear();
      await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'First Design' });

      const res2 = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Second Design' });

      expect(res2.status).toBe(201);
      expect(res2.body.data.design.designCode).toBe(`DES-${currentYear}-000002`);
    });

    it('should reject creation with duplicate design name (409 Conflict)', async () => {
      await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Design Name' });

      const dupRes = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'unique design name' });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.error.code).toBe('DUPLICATE_DESIGN');
    });

    it('should reject creation with missing required name (400 Bad Request)', async () => {
      const res = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ category: 'Logos' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject unauthorized creation request (401 Unauthorized)', async () => {
      const res = await request.post('/api/v1/designs').send({ name: 'Unauthorized Design' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/designs & Category Filtering/Search/Pagination', () => {
    beforeEach(async () => {
      await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dragon Crest', category: 'Fantasy', primaryFileType: 'DST' });

      await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Corporate Badge', category: 'Logos', primaryFileType: 'PES' });
    });

    it('should list all active designs with pagination metadata', async () => {
      const res = await request.get('/api/v1/designs').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designs).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    it('should filter designs by category', async () => {
      const res = await request
        .get('/api/v1/designs?category=Fantasy')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.designs).toHaveLength(1);
      expect(res.body.data.designs[0].name).toBe('Dragon Crest');
    });

    it('should perform case-insensitive search by design name', async () => {
      const res = await request
        .get('/api/v1/designs?search=corporate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.designs).toHaveLength(1);
      expect(res.body.data.designs[0].name).toBe('Corporate Badge');
    });
  });

  describe('GET /api/v1/designs/:id & PUT /api/v1/designs/:id', () => {
    let designId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update Target Design', category: 'Banners' });

      designId = createRes.body.data.design.id;
    });

    it('should get design details by ID', async () => {
      const res = await request
        .get(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.design.id).toBe(designId);
    });

    it('should return 404 for non-existent design ID', async () => {
      const res = await request
        .get('/api/v1/designs/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('DESIGN_NOT_FOUND');
    });

    it('should update design details (ADMIN role)', async () => {
      const res = await request
        .put(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Design Name', stitchCount: 15000 });

      expect(res.status).toBe(200);
      expect(res.body.data.design.name).toBe('Updated Design Name');
      expect(res.body.data.design.stitchCount).toBe(15000);
    });

    it('should reject update attempt from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .put(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ name: 'Hacked Design Name' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('DELETE /api/v1/designs/:id (Archive)', () => {
    let designId: string;

    beforeEach(async () => {
      const createRes = await request
        .post('/api/v1/designs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Archive Target Design' });

      designId = createRes.body.data.design.id;
    });

    it('should archive design (ADMIN role)', async () => {
      const res = await request
        .delete(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Design archived successfully.');

      // Verify archived design is no longer retrievable
      const getRes = await request
        .get(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should reject archive attempt from OPERATOR role (403 Forbidden)', async () => {
      const res = await request
        .delete(`/api/v1/designs/${designId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});
