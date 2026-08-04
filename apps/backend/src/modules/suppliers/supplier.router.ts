import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { supplierController } from './supplier.controller';
import {
  createSupplierSchema,
  supplierQuerySchema,
  updateSupplierSchema,
  updateSupplierStatusSchema,
} from './supplier.schema';

const router: IRouter = Router();

router.get('/', authenticate, validateRequest(supplierQuerySchema, 'query'), supplierController.list);
router.get('/:id', authenticate, supplierController.getById);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createSupplierSchema),
  supplierController.create,
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateSupplierSchema),
  supplierController.update,
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateSupplierStatusSchema),
  supplierController.updateStatus,
);

export default router;
