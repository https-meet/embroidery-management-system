import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * HTTP request logger middleware.
 * Logs method, URL, status code, and response time for every request.
 * Attaches to the response 'finish' event so the status code is available.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    logger.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
