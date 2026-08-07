import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import authRouter from '../../auth/auth.router';
import { authService } from '../../auth/auth.service';
import { jwtService } from '../../auth/jwt.service';
import { passwordService } from '../../auth/password.service';
import { sessionRepository } from '../session.repository';
import { sessionService } from '../session.service';
import { settingsService } from '../../settings/settings.service';
import { userService } from '../../users/users.service';

describe('Milestone 6.0 - Revocable Session Engine Integration Test Suite', () => {
  let app: express.Application;
  let request: ReturnType<typeof supertest>;

  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'operator@ebms.local',
    name: 'Test Operator',
    passwordHash: '',
    role: 'OPERATOR' as const,
    isActive: true,
    mustChangePassword: false,
    createdBy: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sessionsDb = new Map<string, any>();

  beforeEach(async () => {
    sessionsDb.clear();
    mockUser.isActive = true;
    mockUser.mustChangePassword = false;

    mockUser.passwordHash = await passwordService.hash('Password123!');

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

    // Mock Auth Repository DB Calls
    authService['repo'].findByEmail = async (email: string) => {
      if (email.toLowerCase() === mockUser.email.toLowerCase()) return mockUser as any;
      return null;
    };
    authService['repo'].findById = async (id: string) => {
      if (id === mockUser.id) return mockUser as any;
      return null;
    };
    authService['repo'].updateLastLoginAt = async () => mockUser as any;
    authService['repo'].updatePassword = async (id, hash, mustChange) => {
      if (id === mockUser.id) {
        mockUser.passwordHash = hash;
        mockUser.mustChangePassword = mustChange ?? false;
      }
      return mockUser as any;
    };

    // Mock Session Repository DB Calls
    sessionRepository.findById = async (id: string) => {
      return sessionsDb.get(id) || null;
    };
    sessionRepository.create = async (data: any) => {
      const id = data.id || `session-${sessionsDb.size + 1}`;
      const session = {
        id,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        lastIpAddress: data.lastIpAddress || '127.0.0.1',
        userAgent: data.userAgent || 'Vitest',
        revokedAt: null,
        revokedReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(),
      };
      sessionsDb.set(id, session);
      return session as any;
    };
    sessionRepository.update = async (id: string, data: any) => {
      const existing = sessionsDb.get(id);
      if (!existing) throw new Error('Session not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      sessionsDb.set(id, updated);
      return updated as any;
    };
    sessionRepository.revokeSession = async (id: string, reason: string) => {
      const existing = sessionsDb.get(id);
      if (!existing) throw new Error('Session not found');
      const updated = { ...existing, revokedAt: new Date(), revokedReason: reason, updatedAt: new Date() };
      sessionsDb.set(id, updated);
      return updated as any;
    };
    sessionRepository.revokeAllUserSessions = async (userId: string, reason: string, excludeSessionId?: string) => {
      let count = 0;
      for (const [id, session] of sessionsDb.entries()) {
        if (session.userId === userId && session.revokedAt === null && id !== excludeSessionId) {
          session.revokedAt = new Date();
          session.revokedReason = reason;
          count++;
        }
      }
      return count;
    };
    sessionRepository.countActiveUserSessions = async (userId: string) => {
      let count = 0;
      for (const session of sessionsDb.values()) {
        if (session.userId === userId && session.revokedAt === null && session.expiresAt > new Date()) {
          count++;
        }
      }
      return count;
    };
    sessionRepository.revokeOldestActiveSession = async (userId: string, reason: string) => {
      let oldest: any = null;
      for (const session of sessionsDb.values()) {
        if (session.userId === userId && session.revokedAt === null && session.expiresAt > new Date()) {
          if (!oldest || session.createdAt < oldest.createdAt) {
            oldest = session;
          }
        }
      }
      if (oldest) {
        oldest.revokedAt = new Date();
        oldest.revokedReason = reason;
      }
    };
    sessionRepository.cleanupExpiredSessions = async (cutoff: Date) => {
      let deleted = 0;
      for (const [id, session] of Array.from(sessionsDb.entries())) {
        if (session.revokedAt !== null && session.expiresAt < cutoff) {
          sessionsDb.delete(id);
          deleted++;
        }
      }
      return deleted;
    };

    // User Repo Mocks for User Service
    userService['repo'].findById = async (id: string) => {
      if (id === mockUser.id) return mockUser as any;
      return null;
    };
    userService['repo'].updateStatus = async (id: string, isActive: boolean) => {
      if (id === mockUser.id) {
        mockUser.isActive = isActive;
      }
      return mockUser as any;
    };
    userService['repo'].updatePassword = async (id: string, hash: string, mustChange: boolean) => {
      if (id === mockUser.id) {
        mockUser.passwordHash = hash;
        mockUser.mustChangePassword = mustChange;
      }
      return mockUser as any;
    };

    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('1. Login Creates Session', () => {
    it('should authenticate credentials, create a session in PostgreSQL, and return tokens containing sid', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();

      const decoded = jwtService.verifyRefreshToken(res.body.data.tokens.refreshToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.sid).toBeDefined();

      const session = await sessionRepository.findById(decoded!.sid);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(mockUser.id);
      expect(session?.revokedAt).toBeNull();
    });
  });

  describe('2. Refresh Validates Session & Token Rotation', () => {
    it('should validate session, rotate refresh token, and update stored SHA-256 hash', async () => {
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });

      const initialRefreshToken = loginRes.body.data.tokens.refreshToken;
      const initialPayload = jwtService.verifyRefreshToken(initialRefreshToken)!;
      const sessionBefore = await sessionRepository.findById(initialPayload.sid);
      const hashBefore = sessionBefore?.refreshTokenHash;

      const refreshRes = await request.post('/api/v1/auth/refresh').send({
        refreshToken: initialRefreshToken,
      });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();

      const rotatedRefreshToken = refreshRes.body.data.refreshToken;
      expect(rotatedRefreshToken).not.toBe(initialRefreshToken);

      const sessionAfter = await sessionRepository.findById(initialPayload.sid);
      expect(sessionAfter?.refreshTokenHash).not.toBe(hashBefore);

      // Old refresh token must be rejected after rotation
      const replayRes = await request.post('/api/v1/auth/refresh').send({
        refreshToken: initialRefreshToken,
      });
      expect(replayRes.status).toBe(401);
      expect(replayRes.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('3. Revoked Session Rejected', () => {
    it('should reject refresh attempt if session has been revoked', async () => {
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });

      const refreshToken = loginRes.body.data.tokens.refreshToken;
      const payload = jwtService.verifyRefreshToken(refreshToken)!;

      // Manually revoke session
      await sessionService.revokeSession(payload.sid, 'TEST_REVOCATION');

      const refreshRes = await request.post('/api/v1/auth/refresh').send({
        refreshToken,
      });

      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.error.code).toBe('SESSION_REVOKED');
    });
  });

  describe('4. Expired Session Rejected', () => {
    it('should reject refresh attempt if session has expired', async () => {
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });

      const refreshToken = loginRes.body.data.tokens.refreshToken;
      const payload = jwtService.verifyRefreshToken(refreshToken)!;

      // Manually set session expiresAt to past
      const session = sessionsDb.get(payload.sid);
      session.expiresAt = new Date(Date.now() - 1000);

      const refreshRes = await request.post('/api/v1/auth/refresh').send({
        refreshToken,
      });

      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.error.code).toBe('SESSION_EXPIRED');
    });
  });

  describe('5. Logout Revokes Current Session', () => {
    it('should revoke current session on logout with reason USER_LOGOUT', async () => {
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });

      const refreshToken = loginRes.body.data.tokens.refreshToken;
      const payload = jwtService.verifyRefreshToken(refreshToken)!;

      const logoutRes = await request.post('/api/v1/auth/logout').send({
        refreshToken,
      });

      expect(logoutRes.status).toBe(200);

      const session = await sessionRepository.findById(payload.sid);
      expect(session?.revokedAt).not.toBeNull();
      expect(session?.revokedReason).toBe('USER_LOGOUT');
    });
  });

  describe('6. Password Change Revokes Other Sessions', () => {
    it('should revoke all other active sessions when user changes password, keeping current session alive', async () => {
      const login1 = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });
      const token1 = login1.body.data.tokens.accessToken;
      const refresh1 = login1.body.data.tokens.refreshToken;
      const sid1 = jwtService.verifyRefreshToken(refresh1)!.sid;

      const login2 = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });
      const refresh2 = login2.body.data.tokens.refreshToken;
      const sid2 = jwtService.verifyRefreshToken(refresh2)!.sid;

      const changeRes = await request
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewSecurePassword@2026!',
          refreshToken: refresh1,
        });

      expect(changeRes.status).toBe(200);

      // Current session (sid1) remains active
      const session1 = await sessionRepository.findById(sid1);
      expect(session1?.revokedAt).toBeNull();

      // Other session (sid2) is revoked with PASSWORD_CHANGED
      const session2 = await sessionRepository.findById(sid2);
      expect(session2?.revokedAt).not.toBeNull();
      expect(session2?.revokedReason).toBe('PASSWORD_CHANGED');
    });
  });

  describe('7. Admin Password Reset & User Deactivation', () => {
    it('should revoke all active sessions on admin password reset with reason ADMIN_PASSWORD_RESET', async () => {
      const login = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });
      const sid = jwtService.verifyRefreshToken(login.body.data.tokens.refreshToken)!.sid;

      const adminUser = { userId: 'admin-uuid', email: 'admin@ebms.local', role: 'ADMIN' as const, dbMode: 'production' as const, type: 'access' as const };
      await userService.resetUserPassword(mockUser.id, adminUser);

      const session = await sessionRepository.findById(sid);
      expect(session?.revokedAt).not.toBeNull();
      expect(session?.revokedReason).toBe('ADMIN_PASSWORD_RESET');
    });

    it('should revoke all active sessions on user deactivation with reason USER_DEACTIVATED', async () => {
      const login = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });
      const sid = jwtService.verifyRefreshToken(login.body.data.tokens.refreshToken)!.sid;

      const adminUser = { userId: 'admin-uuid', email: 'admin@ebms.local', role: 'ADMIN' as const, dbMode: 'production' as const, type: 'access' as const };
      await userService.updateUserStatus(mockUser.id, { isActive: false }, adminUser);

      const session = await sessionRepository.findById(sid);
      expect(session?.revokedAt).not.toBeNull();
      expect(session?.revokedReason).toBe('USER_DEACTIVATED');
    });
  });

  describe('8. Session Limit Enforcement', () => {
    it('should revoke oldest active session with reason SESSION_LIMIT_EXCEEDED when active sessions exceed MAX_ACTIVE_SESSIONS (5)', async () => {
      const sids: string[] = [];

      for (let i = 0; i < 5; i++) {
        const login = await request.post('/api/v1/auth/login').send({
          email: 'operator@ebms.local',
          password: 'Password123!',
        });
        const sid = jwtService.verifyRefreshToken(login.body.data.tokens.refreshToken)!.sid;
        sids.push(sid);
      }

      // 6th login exceeds limit of 5
      const login6 = await request.post('/api/v1/auth/login').send({
        email: 'operator@ebms.local',
        password: 'Password123!',
      });
      const sid6 = jwtService.verifyRefreshToken(login6.body.data.tokens.refreshToken)!.sid;

      // Oldest session (sids[0]) must be revoked with SESSION_LIMIT_EXCEEDED
      const oldestSession = await sessionRepository.findById(sids[0]!);
      expect(oldestSession?.revokedAt).not.toBeNull();
      expect(oldestSession?.revokedReason).toBe('SESSION_LIMIT_EXCEEDED');

      // Newest session (sid6) is active
      const newestSession = await sessionRepository.findById(sid6);
      expect(newestSession?.revokedAt).toBeNull();
    });
  });

  describe('9. Session Cleanup Utility', () => {
    it('should clean up revoked and expired sessions older than retention cutoff', async () => {
      const oldSession = await sessionRepository.create({
        userId: mockUser.id,
        refreshTokenHash: 'hash-old',
        expiresAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      });
      await sessionService.revokeSession(oldSession.id, 'OLD_REVOCATION');

      const deletedCount = await sessionService.cleanupExpiredSessions(30);
      expect(deletedCount).toBeGreaterThanOrEqual(1);
      const found = await sessionRepository.findById(oldSession.id);
      expect(found).toBeNull();
    });
  });
});
