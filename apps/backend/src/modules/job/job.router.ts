import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { jobController } from './job.controller';
import { createJobSchema, jobQuerySchema, updateJobSchema } from './job.schema';

const router: IRouter = Router();

// All Job / Order routes require authentication
router.use(authenticate);

router.post(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(createJobSchema),
  jobController.create,
);

router.get(
  '/',
  requireRole('ADMIN', 'MANAGER', 'OPERATOR'),
  validateRequest(jobQuerySchema, 'query'),
  jobController.list,
);

router.get('/:id', requireRole('ADMIN', 'MANAGER', 'OPERATOR'), jobController.getById);

router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateRequest(updateJobSchema),
  jobController.update,
);

router.delete('/:id', requireRole('ADMIN'), jobController.archive);

export default router;
