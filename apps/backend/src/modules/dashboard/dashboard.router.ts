import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { dashboardController } from './dashboard.controller';

const router: IRouter = Router();

router.use(authenticate);

router.get('/summary', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), dashboardController.getSummary);

export default router;
