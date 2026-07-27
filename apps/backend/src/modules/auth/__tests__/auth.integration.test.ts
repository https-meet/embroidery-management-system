import type { Role, User } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { authenticate, requireRole } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { authRepository } from '../auth.repository';
import authRouter from '../auth.router';

class MockAuthRepository {
  public users: Map<string, User> = new Map();

  public async findByEmail(email: string): Promise<User | null> {
    const lower = email.toLowerCase();
    for (const u of this.users.values()) {
      if (u.email === lower) return u;
    }
    return null;
  }

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  public async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    const user: User = {
      id: `uuid-${Date.now()}-${Math.random()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? 'OPERATOR',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
}

describe('Authentication Module & Middleware Integration', () => {
  let mockRepo: MockAuthRepository;
  let request: ReturnType<typeof supertest>;

  beforeEach(() => {
    mockRepo = new MockAuthRepository();

    authRepository.findByEmail = mockRepo.findByEmail.bind(mockRepo);
    authRepository.findById = mockRepo.findById.bind(mockRepo);
    authRepository.create = mockRepo.create.bind(mockRepo);

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/auth', authRouter);
    v1.get('/admin-only', authenticate, requireRole('ADMIN'), (_req, res) => {
      res.status(200).json({ success: true, data: { adminAccess: true } });
    });

    app.use('/api/v1', v1);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration with duplicate email', async () => {
      await request.post('/api/v1/auth/register').send({
        name: 'First User',
        email: 'unique@example.com',
        password: 'Password123!',
      });

      const dupRes = await request.post('/api/v1/auth/register').send({
        name: 'Duplicate User',
        email: 'UNIQUE@example.com',
        password: 'Password123!',
      });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration violating password policy', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: 'Weak User',
        email: 'weak@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PASSWORD_POLICY_VIOLATION');
    });

    it('should return validation error envelope for invalid input schema', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123!',
        role: 'OPERATOR',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'user1@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('user1@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(typeof res.body.data.tokens.accessToken).toBe('string');
      expect(typeof res.body.data.tokens.refreshToken).toBe('string');
    });

    it('should reject login with wrong password', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'user1@example.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for inactive user', async () => {
      const user = await mockRepo.findByEmail('user1@example.com');
      if (user) {
        user.isActive = false;
      }

      const res = await request.post('/api/v1/auth/login').send({
        email: 'user1@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_INACTIVE');
    });
  });

  describe('POST /api/v1/auth/refresh & Logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Password123!',
      });

      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'user2@example.com',
        password: 'Password123!',
      });

      refreshToken = loginRes.body.data.tokens.refreshToken;
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({
        refreshToken: 'invalid-refresh-token',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should logout successfully', async () => {
      const res = await request.post('/api/v1/auth/logout').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully.');
    });
  });

  describe('Middleware & Protected Routes', () => {
    let adminToken: string;
    let operatorToken: string;

    beforeEach(async () => {
      const adminReg = await request.post('/api/v1/auth/register').send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      });

      const opReg = await request.post('/api/v1/auth/register').send({
        name: 'Operator User',
        email: 'op@example.com',
        password: 'Password123!',
        role: 'OPERATOR',
      });

      const adminLogin = await request.post('/api/v1/auth/login').send({
        email: 'admin@example.com',
        password: 'Password123!',
      });

      const opLogin = await request.post('/api/v1/auth/login').send({
        email: 'op@example.com',
        password: 'Password123!',
      });

      adminToken = adminLogin.body.data.tokens.accessToken;
      operatorToken = opLogin.body.data.tokens.accessToken;

      expect(adminReg.status).toBe(201);
      expect(opReg.status).toBe(201);
    });

    it('should return profile for authenticated user on GET /api/v1/auth/me', async () => {
      const res = await request.get('/api/v1/auth/me').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@example.com');
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should reject protected route request missing Authorization header', async () => {
      const res = await request.get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject protected route request with invalid Bearer token', async () => {
      const res = await request.get('/api/v1/auth/me').set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_ACCESS_TOKEN');
    });

    it('should allow ADMIN role on requireRole("ADMIN") protected route', async () => {
      const res = await request
        .get('/api/v1/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.adminAccess).toBe(true);
    });

    it('should reject OPERATOR role on requireRole("ADMIN") protected route with 403 Forbidden', async () => {
      const res = await request
        .get('/api/v1/admin-only')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});
