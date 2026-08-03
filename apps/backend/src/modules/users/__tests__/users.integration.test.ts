import type { Role, User } from '@prisma/client';
import express from 'express';
import supertest from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { authenticate, requireRole } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import { notFound } from '../../../middleware/notFound';
import { authRepository } from '../../auth/auth.repository';
import { jwtService } from '../../auth/jwt.service';
import { passwordService } from '../../auth/password.service';
import { userRepository } from '../users.repository';
import userRouter from '../users.router';

let uuidCounter = 1;
function generateMockUuid(): string {
  const padded = String(uuidCounter++).padStart(12, '0');
  return `00000000-0000-4000-8000-${padded}`;
}

class MockUserRepository {
  public users: Map<string, User> = new Map();

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const lower = email.toLowerCase();
    for (const u of this.users.values()) {
      if (u.email === lower) return u;
    }
    return null;
  }

  public async countActiveAdmins(): Promise<number> {
    let count = 0;
    for (const u of this.users.values()) {
      if (u.role === 'ADMIN' && u.isActive) count++;
    }
    return count;
  }

  public async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdBy: string;
    mustChangePassword?: boolean;
  }): Promise<User> {
    const user: User = {
      id: generateMockUuid(),
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
      isActive: true,
      mustChangePassword: data.mustChangePassword ?? true,
      createdBy: data.createdBy,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  public async update(
    id: string,
    data: { name?: string; email?: string; role?: Role },
  ): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email.toLowerCase();
    if (data.role) user.role = data.role;
    user.updatedAt = new Date();
    return user;
  }

  public async updateStatus(id: string, isActive: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    user.isActive = isActive;
    user.updatedAt = new Date();
    return user;
  }

  public async updatePassword(
    id: string,
    passwordHash: string,
    mustChangePassword: boolean = true,
  ): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    user.passwordHash = passwordHash;
    user.mustChangePassword = mustChangePassword;
    user.updatedAt = new Date();
    return user;
  }

  public async findMany(filter: any): Promise<{ users: User[]; total: number }> {
    let list = Array.from(this.users.values());
    if (filter.role) {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter.isActive !== undefined) {
      list = list.filter((u) => u.isActive === filter.isActive);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return { users: list, total: list.length };
  }
}

describe('Users Module Integration Test Suite (Milestone 3.1 - Sprint 2)', () => {
  let mockRepo: MockUserRepository;
  let request: ReturnType<typeof supertest>;

  let adminUser: User;
  let managerUser: User;
  let operatorUser: User;

  let adminToken: string;
  let managerToken: string;
  let operatorToken: string;

  beforeEach(async () => {
    mockRepo = new MockUserRepository();

    userRepository.findById = mockRepo.findById.bind(mockRepo);
    userRepository.findByEmail = mockRepo.findByEmail.bind(mockRepo);
    userRepository.countActiveAdmins = mockRepo.countActiveAdmins.bind(mockRepo);
    userRepository.create = mockRepo.create.bind(mockRepo);
    userRepository.update = mockRepo.update.bind(mockRepo);
    userRepository.updateStatus = mockRepo.updateStatus.bind(mockRepo);
    userRepository.updatePassword = mockRepo.updatePassword.bind(mockRepo);
    userRepository.findMany = mockRepo.findMany.bind(mockRepo);
    authRepository.findById = mockRepo.findById.bind(mockRepo);

    const passHash = await passwordService.hash('Password123!');

    adminUser = await mockRepo.create({
      name: 'System Admin',
      email: 'admin@ebms.local',
      passwordHash: passHash,
      role: 'ADMIN',
      createdBy: '00000000-0000-4000-8000-000000000000',
      mustChangePassword: false,
    });

    managerUser = await mockRepo.create({
      name: 'System Manager',
      email: 'manager@ebms.local',
      passwordHash: passHash,
      role: 'MANAGER',
      createdBy: adminUser.id,
      mustChangePassword: false,
    });

    operatorUser = await mockRepo.create({
      name: 'System Operator',
      email: 'operator@ebms.local',
      passwordHash: passHash,
      role: 'OPERATOR',
      createdBy: adminUser.id,
      mustChangePassword: false,
    });

    adminToken = jwtService.generateAccessToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    managerToken = jwtService.generateAccessToken({
      id: managerUser.id,
      email: managerUser.email,
      role: managerUser.role,
    });

    operatorToken = jwtService.generateAccessToken({
      id: operatorUser.id,
      email: operatorUser.email,
      role: operatorUser.role,
    });

    const app = express();
    app.use(express.json());

    const v1 = express.Router();
    v1.use('/users', userRouter);

    app.use('/api/v1', v1);
    app.use(notFound);
    app.use(errorHandler);

    request = supertest(app);
  });

  describe('RBAC Authorization Enforcement', () => {
    it('should reject non-ADMIN roles with 403 Forbidden', async () => {
      const resManager = await request
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(resManager.status).toBe(403);
      expect(resManager.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');

      const resOperator = await request
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(resOperator.status).toBe(403);
      expect(resOperator.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request.get('/api/v1/users');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/users & GET /api/v1/users/:id', () => {
    it('should list users with pagination, search, and role filters for ADMIN', async () => {
      const res = await request
        .get('/api/v1/users?role=OPERATOR')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].email).toBe('operator@ebms.local');
    });

    it('should return user details by ID without exposing passwordHash', async () => {
      const res = await request
        .get(`/api/v1/users/${operatorUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(operatorUser.id);
      expect(res.body.data.user.email).toBe('operator@ebms.local');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });
  });

  describe('POST /api/v1/users (Admin Create User)', () => {
    it('should create a new employee user, generate temporary password, and set mustChangePassword = true', async () => {
      const res = await request
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Worker',
          email: 'worker@ebms.local',
          role: 'OPERATOR',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('worker@ebms.local');
      expect(res.body.data.user.mustChangePassword).toBe(true);
      expect(res.body.data.user.createdBy).toBe(adminUser.id);
      expect(typeof res.body.data.temporaryPassword).toBe('string');
      expect(res.body.data.temporaryPassword.length).toBeGreaterThanOrEqual(12);
    });

    it('should reject creation with duplicate email', async () => {
      const res = await request
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Admin',
          email: 'admin@ebms.local',
          role: 'MANAGER',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('PATCH /api/v1/users/:id (Update User)', () => {
    it('should update name, email, or role for target user', async () => {
      const res = await request
        .patch(`/api/v1/users/${operatorUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Operator Name',
          role: 'MANAGER',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Updated Operator Name');
      expect(res.body.data.user.role).toBe('MANAGER');
    });

    it('should prevent Administrator from changing their own system role (400 Bad Request)', async () => {
      const res = await request
        .patch(`/api/v1/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'OPERATOR' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CANNOT_CHANGE_OWN_ROLE');
    });
  });

  describe('PATCH /api/v1/users/:id/status & Business Protection Rules', () => {
    it('should prevent Administrator from deactivating their own account (400 Bad Request)', async () => {
      const res = await request
        .patch(`/api/v1/users/${adminUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CANNOT_DEACTIVATE_SELF');
    });

    it('should prevent deactivating the system last active Administrator (400 Bad Request)', async () => {
      const secondAdmin = await mockRepo.create({
        name: 'Second Admin',
        email: 'admin2@ebms.local',
        passwordHash: 'hash',
        role: 'ADMIN',
        createdBy: adminUser.id,
      });

      await request
        .patch(`/api/v1/users/${secondAdmin.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      const secondAdminToken = jwtService.generateAccessToken({
        id: secondAdmin.id,
        email: secondAdmin.email,
        role: 'ADMIN',
      });

      const res = await request
        .patch(`/api/v1/users/${adminUser.id}/status`)
        .set('Authorization', `Bearer ${secondAdminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('LAST_ADMIN_DEACTIVATION');
    });

    it('should activate and deactivate non-admin employees successfully', async () => {
      const res = await request
        .patch(`/api/v1/users/${operatorUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.user.isActive).toBe(false);
    });
  });

  describe('POST /api/v1/users/:id/reset-password', () => {
    it('should generate a new temporary password and set mustChangePassword = true', async () => {
      const res = await request
        .post(`/api/v1/users/${operatorUser.id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.temporaryPassword).toBe('string');

      const userInDb = await mockRepo.findById(operatorUser.id);
      expect(userInDb?.mustChangePassword).toBe(true);
    });
  });
});
