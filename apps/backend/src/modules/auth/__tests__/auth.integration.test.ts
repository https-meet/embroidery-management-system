import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { authenticate, requireRole } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import authRouter from '../auth.router';
import { authRepository } from '../auth.repository';
import { authService } from '../auth.service';
import type { UserResponseDto } from '../auth.types';
import { passwordService } from '../password.service';
import { sessionService } from '../../session/session.service';
import { settingsService } from '../../settings/settings.service';

class MockAuthRepository {
  public users = new Map<string, {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
    isActive: boolean;
    mustChangePassword: boolean;
    createdBy: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>();

  public async findByEmail(email: string) {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  public async findById(id: string) {
    const u = this.users.get(id);
    return u || null;
  }

  public async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'ADMIN' | 'MANAGER' | 'OPERATOR';
    mustChangePassword?: boolean;
    createdBy?: string;
  }) {
    const id = `user-${this.users.size + 1}`;
    const user = {
      id,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role || 'OPERATOR',
      isActive: true,
      mustChangePassword: data.mustChangePassword ?? false,
      createdBy: data.createdBy || null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  public async updateLastLoginAt(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    user.lastLoginAt = new Date();
  }

  public async updatePassword(id: string, passwordHash: string, mustChangePassword = false) {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    user.passwordHash = passwordHash;
    user.mustChangePassword = mustChangePassword;
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
    authRepository.updateLastLoginAt = mockRepo.updateLastLoginAt.bind(mockRepo);
    authRepository.updatePassword = mockRepo.updatePassword.bind(mockRepo);

    settingsService.logAuditAction = async (entry: any) => ({
      id: 'mock-audit-id',
      userId: entry.userId || null,
      userName: entry.userName,
      action: entry.action,
      entityType: entry.entityType,
      timestamp: new Date(),
    });

    sessionService.createSession = async (userId: string) => {
      const now = new Date();
      return {
        id: 'mock-session-id',
        userId,
        refreshTokenHash: 'hash',
        lastIpAddress: '127.0.0.1',
        userAgent: 'test',
        revokedAt: null,
        revokedReason: null,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: now,
      };
    };
    sessionService.verifyAndRotateSession = async (sid: string) => {
      const now = new Date();
      return {
        id: sid,
        userId: 'mock-user',
        refreshTokenHash: 'new-hash',
        lastIpAddress: '127.0.0.1',
        userAgent: 'test',
        revokedAt: null,
        revokedReason: null,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: now,
      };
    };
    sessionService.revokeSession = async () => null;
    sessionService.revokeAllUserSessions = async () => 0;

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

  describe('Public Registration Removal Check', () => {
    it('should return 404 Not Found for POST /api/v1/auth/register', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: 'Attacker',
        email: 'attacker@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('Admin User Creation Foundation (createUserFoundation)', () => {
    it('should create user with crypto temporary password, mustChangePassword = true, and recorded createdBy', async () => {
      const result = await authService.createUserFoundation({
        name: 'New Operator',
        email: 'operator@ebms.local',
        role: 'OPERATOR',
        createdByAdminId: 'admin-uuid-123',
      });

      expect(result.user.email).toBe('operator@ebms.local');
      expect(result.user.role).toBe('OPERATOR');
      expect(result.user.mustChangePassword).toBe(true);
      expect(result.user.createdBy).toBe('admin-uuid-123');
      expect(typeof result.temporaryPassword).toBe('string');
      expect(result.temporaryPassword.length).toBeGreaterThanOrEqual(12);

      // Verify user can log in with generated temporary password
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: result.temporaryPassword,
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.mustChangePassword).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login & lastLoginAt', () => {
    beforeEach(async () => {
      const passHash = await passwordService.hash('Password123!');
      await mockRepo.create({
        name: 'User One',
        email: 'user1@example.com',
        passwordHash: passHash,
        role: 'OPERATOR',
        mustChangePassword: true,
      });
    });

    it('should login successfully, return mustChangePassword, and update lastLoginAt', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'user1@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('user1@example.com');
      expect(res.body.data.user.mustChangePassword).toBe(true);
      expect(typeof res.body.data.tokens.accessToken).toBe('string');

      const userInDb = await mockRepo.findByEmail('user1@example.com');
      expect(userInDb?.lastLoginAt).not.toBeNull();
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

  describe('POST /api/v1/auth/change-password', () => {
    let token: string;

    beforeEach(async () => {
      const passHash = await passwordService.hash('TempPassword123!');
      await mockRepo.create({
        name: 'User Password Change',
        email: 'change@example.com',
        passwordHash: passHash,
        role: 'OPERATOR',
        mustChangePassword: true,
      });

      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'change@example.com',
        password: 'TempPassword123!',
      });

      token = loginRes.body.data.tokens.accessToken;
    });

    it('should change password successfully and set mustChangePassword = false', async () => {
      const res = await request
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'TempPassword123!',
          newPassword: 'NewSecurePassword@2026!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const userInDb = await mockRepo.findByEmail('change@example.com');
      expect(userInDb?.mustChangePassword).toBe(false);

      // Verify user can now log in with new password
      const newLoginRes = await request.post('/api/v1/auth/login').send({
        email: 'change@example.com',
        password: 'NewSecurePassword@2026!',
      });

      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.data.user.mustChangePassword).toBe(false);
    });

    it('should reject change-password with wrong current password', async () => {
      const res = await request
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongTempPassword123!',
          newPassword: 'NewSecurePassword@2026!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });

  describe('Middleware & Protected Routes', () => {
    let adminToken: string;
    let operatorToken: string;

    beforeEach(async () => {
      const passHash = await passwordService.hash('Password123!');
      await mockRepo.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: passHash,
        role: 'ADMIN',
      });

      await mockRepo.create({
        name: 'Operator User',
        email: 'op@example.com',
        passwordHash: passHash,
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
    });

    it('should return profile for authenticated user on GET /api/v1/auth/me', async () => {
      const res = await request.get('/api/v1/auth/me').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@example.com');
      expect(res.body.data.user.role).toBe('ADMIN');
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
