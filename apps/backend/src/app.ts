import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import router from './routes';

/**
 * Creates and configures the Express application.
 * Separated from server.ts so the app can be imported in tests
 * without binding to a port.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Request logging ───────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api/v1', router);

  // ── 404 handler (after all routes) ───────────────────────────────────────
  app.use(notFound);

  // ── Global error handler (must be last) ──────────────────────────────────
  app.use(errorHandler);

  return app;
}
