import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import type { AccessTokenPayload } from '../modules/auth/jwt.service';
import { jwtService } from '../modules/auth/jwt.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}

/**
 * Authentication middleware.
 * Verifies Bearer JWT access token from Authorization header and attaches req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('UNAUTHORIZED', 'Authentication token required.'));
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    next(new UnauthorizedError('UNAUTHORIZED', 'Authentication token required.'));
    return;
  }

  const payload = jwtService.verifyAccessToken(token);
  if (!payload) {
    next(new UnauthorizedError('INVALID_ACCESS_TOKEN', 'Invalid or expired access token.'));
    return;
  }

  req.user = payload;
  next();
}

/**
 * Role-based authorization middleware factory.
 * Ensures the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('UNAUTHORIZED', 'Authentication required.'));
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          'INSUFFICIENT_PERMISSIONS',
          'Insufficient permissions for this action.',
        ),
      );
      return;
    }

    next();
  };
}
