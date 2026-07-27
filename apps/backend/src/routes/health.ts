import { Router, type IRouter } from 'express';

const router: IRouter = Router();

/**
 * GET /health
 *
 * Liveness probe endpoint.
 * Returns HTTP 200 when the server is running.
 * Does NOT check database connectivity — that is a readiness concern for a later task.
 */
router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
