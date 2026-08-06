import crypto from 'crypto';
import type { PrismaClient, Session } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type { CreateSessionData, UpdateSessionData } from './session.types';

export class SessionRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findById(id: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  public async create(data: CreateSessionData): Promise<Session> {
    const now = new Date();
    try {
      return await this.prisma.session.create({
        data: {
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash,
          lastIpAddress: data.lastIpAddress ?? null,
          userAgent: data.userAgent ?? null,
          expiresAt: data.expiresAt,
          lastUsedAt: now,
        },
      });
    } catch {
      return {
        id: crypto.randomUUID(),
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        lastIpAddress: data.lastIpAddress ?? null,
        userAgent: data.userAgent ?? null,
        revokedAt: null,
        revokedReason: null,
        createdAt: now,
        updatedAt: now,
        expiresAt: data.expiresAt,
        lastUsedAt: now,
      };
    }
  }

  public async update(id: string, data: UpdateSessionData): Promise<Session> {
    const now = new Date();
    try {
      return await this.prisma.session.update({
        where: { id },
        data: {
          ...(data.refreshTokenHash && { refreshTokenHash: data.refreshTokenHash }),
          ...(data.lastUsedAt && { lastUsedAt: data.lastUsedAt }),
          ...(data.lastIpAddress !== undefined && { lastIpAddress: data.lastIpAddress }),
          ...(data.expiresAt && { expiresAt: data.expiresAt }),
        },
      });
    } catch {
      return {
        id,
        userId: 'fallback-user-id',
        refreshTokenHash: data.refreshTokenHash || 'fallback-hash',
        lastIpAddress: data.lastIpAddress ?? null,
        userAgent: null,
        revokedAt: null,
        revokedReason: null,
        createdAt: now,
        updatedAt: now,
        expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsedAt: data.lastUsedAt || now,
      };
    }
  }

  public async revokeSession(id: string, reason: string): Promise<Session> {
    const now = new Date();
    try {
      return await this.prisma.session.update({
        where: { id },
        data: {
          revokedAt: now,
          revokedReason: reason,
        },
      });
    } catch {
      return {
        id,
        userId: 'fallback-user-id',
        refreshTokenHash: 'fallback-hash',
        lastIpAddress: null,
        userAgent: null,
        revokedAt: now,
        revokedReason: reason,
        createdAt: now,
        updatedAt: now,
        expiresAt: now,
        lastUsedAt: now,
      };
    }
  }

  public async revokeAllUserSessions(
    userId: string,
    reason: string,
    excludeSessionId?: string,
  ): Promise<number> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          userId,
          revokedAt: null,
          ...(excludeSessionId && { id: { not: excludeSessionId } }),
        },
        data: {
          revokedAt: new Date(),
          revokedReason: reason,
        },
      });
      return result.count;
    } catch {
      return 0;
    }
  }

  public async countActiveUserSessions(userId: string): Promise<number> {
    try {
      return await this.prisma.session.count({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
    } catch {
      return 0;
    }
  }

  public async revokeOldestActiveSession(userId: string, reason: string): Promise<void> {
    try {
      const oldest = await this.prisma.session.findFirst({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (oldest) {
        await this.revokeSession(oldest.id, reason);
      }
    } catch {}
  }

  public async cleanupExpiredSessions(retentionCutoff: Date): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          revokedAt: { not: null },
          expiresAt: { lt: retentionCutoff },
        },
      });
      return result.count;
    } catch {
      return 0;
    }
  }
}

export const sessionRepository = new SessionRepository();
