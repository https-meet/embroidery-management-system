import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { invoiceController } from './invoice.controller';
import { createInvoiceSchema, updateInvoiceSchema } from './invoice.schema';

const router: IRouter = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), invoiceController.list);
router.get('/:id', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), invoiceController.getById);

router.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(createInvoiceSchema),
  invoiceController.create,
);

router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(updateInvoiceSchema),
  invoiceController.update,
);

router.post('/:id/cancel', requireRole('ADMIN', 'MANAGER'), invoiceController.cancel);

export default router;
