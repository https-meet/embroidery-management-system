import type { Request } from 'express';
import type { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { productionPrisma } from './production';
import { demoPrisma } from './demo';
import { jwtService } from '../../modules/auth/jwt.service';

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
 * Environment selection is based on:
 * 1. Global config.isDemoMode
 * 2. Explicit request headers ('x-database-mode' === 'demo' or 'x-demo-mode' === 'true')
 * 3. Authenticated user email === 'demo@ebms.com'
 * 4. Login request body email === 'demo@ebms.com'
 */
export function createDatabaseContext(req?: Request): DatabaseContext {
  let isDemo = config.isDemoMode;

  if (req) {
    const dbHeader = req.headers['x-database-mode'] || req.headers['x-demo-mode'];
    if (dbHeader === 'demo' || dbHeader === 'true') {
      isDemo = true;
    }

    if (req.body && typeof req.body === 'object' && req.body.email === 'demo@ebms.com') {
      isDemo = true;
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        if (token) {
          const payload = jwtService.verifyAccessToken(token);
          if (payload?.email === 'demo@ebms.com') {
            isDemo = true;
          }
        }
      } catch {
        // Ignore token verification errors during context resolution
      }
    }
  }

  if (isDemo) {
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
