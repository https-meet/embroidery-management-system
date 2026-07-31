import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { demoGuard } from '../../middleware/demoGuard';
import { settingsController } from './settings.controller';

const router: IRouter = Router();

router.use(authenticate);

router.get('/business', settingsController.getBusinessConfig);
router.put('/business', requireRole('ADMIN', 'MANAGER'), demoGuard('Modifying company tax and business settings'), settingsController.updateBusinessConfig);
router.get('/health', settingsController.getSystemHealth);
router.get('/audit-logs', requireRole('ADMIN', 'MANAGER'), settingsController.listAuditLogs);
router.post('/audit-logs', settingsController.createAuditLog);

export default router;
