import { Router, type IRouter } from 'express';
import healthRouter from './health';

const router: IRouter = Router();

/**
 * API v1 route registry.
 * Register all module routers here as they are implemented.
 *
 * Convention: /api/v1/<resource>
 */
router.use('/health', healthRouter);

// Phase 2 — Customer Management
// router.use('/customers', customersRouter);

// Phase 4 — Job Management
// router.use('/jobs', jobsRouter);

// Phase 5 — Invoice Management
// router.use('/invoices', invoicesRouter);

// Phase 6 — Payment Management
// router.use('/payments', paymentsRouter);

export default router;
