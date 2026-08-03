import { Router, type IRouter } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { demoGuard } from '../../middleware/demoGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { usersController } from './users.controller';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userQuerySchema,
} from './users.schema';

const router: IRouter = Router();

// All user management routes require Authentication AND ADMIN Role (Backend Enforcement)
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', validateRequest(userQuerySchema, 'query'), usersController.list);
router.get('/:id', usersController.getById);

router.post(
  '/',
  demoGuard('Provisioning employee accounts'),
  validateRequest(createUserSchema),
  usersController.create,
);

router.patch(
  '/:id',
  demoGuard('Updating user account details'),
  validateRequest(updateUserSchema),
  usersController.update,
);

router.patch(
  '/:id/status',
  demoGuard('Activating or deactivating user accounts'),
  validateRequest(updateUserStatusSchema),
  usersController.updateStatus,
);

router.post(
  '/:id/reset-password',
  demoGuard('Resetting user passwords'),
  usersController.resetPassword,
);

export default router;
