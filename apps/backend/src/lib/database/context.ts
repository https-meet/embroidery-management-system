import type { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { productionPrisma } from './production';
import { demoPrisma } from './demo';

export type DatabaseEnvironment = 'production' | 'demo';

export interface DatabaseContext {
  environment: DatabaseEnvironment;
  prisma: PrismaClient;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      database?: DatabaseContext;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Creates a DatabaseContext instance for an incoming HTTP request.
 * Environment selection is based strictly on backend configuration (config.isDemoMode).
 */
export function createDatabaseContext(): DatabaseContext {
  if (config.isDemoMode) {
    return {
      environment: 'demo',
      prisma: demoPrisma,
    };
  }

  return {
    environment: 'production',
    prisma: productionPrisma,
  };
}
