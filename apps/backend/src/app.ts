import cors from 'cors';
import express from 'express';
import { config } from './config';
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

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Request logging ───────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Health Endpoint (Unauthenticated Deployment Health Check) ─────────────
  const healthHandler = async (_req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { prisma } = await import('./lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        isDemoMode: config.isDemoMode,
        database: 'CONNECTED',
        uptimeSeconds: Math.floor(process.uptime()),
      });
    } catch {
      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'DISCONNECTED',
        error: 'Database connection check failed',
      });
    }
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api/v1', router);

  // ── 404 handler (after all routes) ───────────────────────────────────────
  app.use(notFound);

  // ── Global error handler (must be last) ──────────────────────────────────
  app.use(errorHandler);

  return app;
}
