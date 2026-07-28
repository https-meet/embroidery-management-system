import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { reportController } from './report.controller';
import { reportFilterSchema } from './report.schema';

const router: IRouter = Router();

router.use(authenticate);

router.get(
  '/customers',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getCustomers,
);
router.get(
  '/jobs',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getJobs,
);
router.get(
  '/production',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getProduction,
);
router.get(
  '/invoices',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getInvoices,
);
router.get(
  '/payments',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getPayments,
);
router.get(
  '/revenue',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(reportFilterSchema, 'query'),
  reportController.getRevenue,
);

export default router;
