import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { purchaseController } from './purchase.controller';
import {
  createPurchaseSchema,
  purchaseQuerySchema,
  updatePurchaseSchema,
} from './purchase.schema';

const router: IRouter = Router();

router.get('/', authenticate, validateRequest(purchaseQuerySchema, 'query'), purchaseController.list);
router.get('/:id', authenticate, purchaseController.getById);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createPurchaseSchema),
  purchaseController.create,
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updatePurchaseSchema),
  purchaseController.update,
);

export default router;
