import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { productionController } from './production.controller';
import {
  assignProductionSchema,
  completeProductionSchema,
  deliveryReadinessSchema,
  qualityCheckSchema,
  startProductionSchema,
} from './production.schema';

const router: IRouter = Router();

// Protect all production routes with authentication
router.use(authenticate);

router.get('/', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), productionController.listQueue);

router.post(
  '/assign',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(assignProductionSchema),
  productionController.assign,
);

router.post(
  '/start',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(startProductionSchema),
  productionController.start,
);

router.post(
  '/complete',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(completeProductionSchema),
  productionController.complete,
);

router.post(
  '/quality-check',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(qualityCheckSchema),
  productionController.qualityCheck,
);

router.post(
  '/deliver',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(deliveryReadinessSchema),
  productionController.deliver,
);

export default router;
