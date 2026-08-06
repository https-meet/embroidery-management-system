import type { PrismaClient } from '@prisma/client';

export type DatabaseKind = 'PRODUCTION' | 'DEMO';

export type DatabaseClient = PrismaClient;
