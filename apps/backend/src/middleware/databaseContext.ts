import type { NextFunction, Request, Response } from 'express';
import { createDatabaseContext } from '../lib/database/context';

/**
 * Database Context Middleware
 * Attaches req.database context to every incoming HTTP request.
 * Wraps existing prisma singleton as 'production' environment.
 */
export function databaseContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const ctx = createDatabaseContext(req);
  req.database = ctx;
  if (ctx.error) {
    return next(ctx.error);
  }
  next();
}
