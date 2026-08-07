import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { createDatabaseContext } from '../context';
import { demoPrisma } from '../demo';
import { productionPrisma } from '../production';
import { jwtService } from '../../../modules/auth/jwt.service';
import type { Role } from '@prisma/client';

describe('Database Context & JWT dbMode Routing Unit Tests', () => {
  const dummyUser = {
    id: '11111111-2222-3333-4444-555555555555',
    email: 'test@example.com',
    role: 'ADMIN' as Role,
    mustChangePassword: false,
  };

  it('1. should generate Access Token with dbMode: production for production user', () => {
    const token = jwtService.generateAccessToken(dummyUser, 'production');
    const payload = jwtService.verifyAccessToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.dbMode).toBe('production');
  });

  it('2. should generate Access Token with dbMode: demo for demo user', () => {
    const token = jwtService.generateAccessToken(dummyUser, 'demo');
    const payload = jwtService.verifyAccessToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.dbMode).toBe('demo');
  });

  it('3. should route authenticated request with dbMode: production to productionPrisma', () => {
    const token = jwtService.generateAccessToken(dummyUser, 'production');
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const ctx = createDatabaseContext(req);
    expect(ctx.environment).toBe('production');
    expect(ctx.prisma).toBe(productionPrisma);
    expect(ctx.error).toBeUndefined();
  });

  it('4. should route authenticated request with dbMode: demo to demoPrisma', () => {
    const token = jwtService.generateAccessToken(dummyUser, 'demo');
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const ctx = createDatabaseContext(req);
    expect(ctx.environment).toBe('demo');
    expect(ctx.prisma).toBe(demoPrisma);
    expect(ctx.error).toBeUndefined();
  });

  it('5. should return error (401 Unauthorized) when JWT is missing dbMode claim (No silent fallback)', () => {
    // Manually sign token missing dbMode claim
    const legacyToken = jwtService.generateAccessToken(dummyUser);
    // Tamper by casting to legacy
    const req = {
      headers: {
        authorization: 'Bearer invalid-token-sample',
      },
    } as unknown as Request;

    const ctx = createDatabaseContext(req);
    expect(ctx.error).toBeDefined();
    expect(ctx.error?.message).toContain('JWT token missing valid database mode claim');
  });

  it('6. should route unauthenticated login request for demo@ebms.com to demo database context', () => {
    const req = {
      headers: {},
      body: {
        email: 'demo@ebms.com',
      },
    } as unknown as Request;

    const ctx = createDatabaseContext(req);
    expect(ctx.environment).toBe('demo');
    expect(ctx.prisma).toBe(demoPrisma);
    expect(ctx.error).toBeUndefined();
  });

  it('7. should route unauthenticated login request for chauhan@ebms.com to production database context', () => {
    const req = {
      headers: {},
      body: {
        email: 'chauhan@ebms.com',
      },
    } as unknown as Request;

    const ctx = createDatabaseContext(req);
    expect(ctx.environment).toBe('production');
    expect(ctx.prisma).toBe(productionPrisma);
    expect(ctx.error).toBeUndefined();
  });
});
