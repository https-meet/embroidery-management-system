import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { materialController } from './material.controller';
import {
  createMaterialSchema,
  materialQuerySchema,
  updateMaterialSchema,
  updateMaterialStatusSchema,
} from './material.schema';

const router: IRouter = Router();

router.get('/', authenticate, validateRequest(materialQuerySchema, 'query'), materialController.list);
router.get('/:id', authenticate, materialController.getById);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createMaterialSchema),
  materialController.create,
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateMaterialSchema),
  materialController.update,
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateMaterialStatusSchema),
  materialController.updateStatus,
);

export default router;
