import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { reportController } from './report.controller';

const router: IRouter = Router();

router.use(authenticate);

router.get('/customers', requireRole('ADMIN', 'MANAGER'), reportController.getCustomers);
router.get('/jobs', requireRole('ADMIN', 'MANAGER'), reportController.getJobs);
router.get('/production', requireRole('ADMIN', 'MANAGER'), reportController.getProduction);
router.get('/invoices', requireRole('ADMIN', 'MANAGER'), reportController.getInvoices);
router.get('/payments', requireRole('ADMIN', 'MANAGER'), reportController.getPayments);
router.get('/revenue', requireRole('ADMIN', 'MANAGER'), reportController.getRevenue);

export default router;
