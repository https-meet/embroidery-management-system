import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { designController } from './design.controller';
import { createDesignSchema, updateDesignSchema } from './design.schema';

const router: IRouter = Router();

// All design catalog routes require authentication
router.use(authenticate);

router.post(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(createDesignSchema),
  designController.create,
);

router.get('/', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), designController.list);

router.get('/:id', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), designController.getById);

router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(updateDesignSchema),
  designController.update,
);

router.delete('/:id', requireRole('ADMIN'), designController.archive);

export default router;
