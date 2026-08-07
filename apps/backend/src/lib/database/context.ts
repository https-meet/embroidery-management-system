import type { Request } from 'express';
import type { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { productionPrisma } from './production';
import { demoPrisma } from './demo';
import { jwtService, type DatabaseEnvironment } from '../../modules/auth/jwt.service';
import { UnauthorizedError } from '../../utils/errors';

export type { DatabaseEnvironment };

export interface DatabaseContext {
  environment: DatabaseEnvironment;
  prisma: PrismaClient;
  error?: Error;
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
 * 
 * Routing Rules:
 * 1. Authenticated Requests (Bearer JWT token present):
 *    - Verifies the token and extracts the `dbMode` claim ('production' | 'demo').
 *    - Routes exclusively using verified `dbMode`.
 *    - If token is present but invalid/missing `dbMode`, returns an error (401 Unauthorized). Zero silent fallbacks.
 * 2. Unauthenticated Requests (Login / public endpoints before token exists):
 *    - Environment selection uses request body email ('demo@ebms.com'), explicit headers, or global config.
 */
export function createDatabaseContext(req?: Request): DatabaseContext {
  if (req) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = jwtService.verifyAccessToken(token);
        if (!payload || !payload.dbMode || (payload.dbMode !== 'production' && payload.dbMode !== 'demo')) {
          return {
            environment: 'production',
            prisma: productionPrisma,
            error: new UnauthorizedError('INVALID_TOKEN_DB_MODE', 'JWT token missing valid database mode claim.'),
          };
        }

        const isDemo = payload.dbMode === 'demo';
        return {
          environment: isDemo ? 'demo' : 'production',
          prisma: isDemo ? demoPrisma : productionPrisma,
        };
      }
    }

    // Unauthenticated request context resolution (e.g. POST /auth/login)
    let isDemo = config.isDemoMode;

    const dbHeader = req.headers['x-database-mode'] || req.headers['x-demo-mode'];
    if (dbHeader === 'demo' || dbHeader === 'true') {
      isDemo = true;
    }

    if (req.body && typeof req.body === 'object' && req.body.email === 'demo@ebms.com') {
      isDemo = true;
    }

    return {
      environment: isDemo ? 'demo' : 'production',
      prisma: isDemo ? demoPrisma : productionPrisma,
    };
  }

  return {
    environment: config.isDemoMode ? 'demo' : 'production',
    prisma: config.isDemoMode ? demoPrisma : productionPrisma,
  };
}
