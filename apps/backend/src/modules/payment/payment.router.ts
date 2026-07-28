import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { paymentController } from './payment.controller';
import { createPaymentSchema, paymentQuerySchema } from './payment.schema';

const router: IRouter = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(paymentQuerySchema, 'query'),
  paymentController.list,
);
router.get('/:id', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), paymentController.getById);

router.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(createPaymentSchema),
  paymentController.create,
);

export default router;
