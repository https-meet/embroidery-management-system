import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware.
 * Must be registered LAST — after all routes and other middleware.
 * The 4-parameter signature is required for Express to recognise it as an error handler.
 *
 * Returns the canonical business error shape (ADR-012).
 * Feature-specific error classes will be handled here in a later task.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled error', err instanceof Error ? err.message : err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}
