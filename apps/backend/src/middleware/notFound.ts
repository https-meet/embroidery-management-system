import type { Request, Response } from 'express';

/**
 * 404 Not Found handler.
 * Must be registered AFTER all application routes.
 * Returns the canonical business error shape (ADR-012).
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
}
