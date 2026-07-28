import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { customerController } from './customer.controller';
import { createCustomerSchema, customerQuerySchema, updateCustomerSchema } from './customer.schema';

const router: IRouter = Router();

// All customer routes require authentication
router.use(authenticate);

router.post(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(createCustomerSchema),
  customerController.create,
);

router.get(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(customerQuerySchema, 'query'),
  customerController.list,
);

router.get('/:id/360', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), customerController.get360);

router.get('/:id', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), customerController.getById);

router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(updateCustomerSchema),
  customerController.update,
);

router.delete('/:id', requireRole('ADMIN'), customerController.archive);

export default router;
