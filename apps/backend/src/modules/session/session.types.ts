import type { Session } from '@prisma/client';

export interface CreateSessionData {
  userId: string;
  refreshTokenHash: string;
  lastIpAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export interface UpdateSessionData {
  refreshTokenHash?: string;
  lastUsedAt?: Date;
  lastIpAddress?: string | null;
  expiresAt?: Date;
}

export type { Session };
