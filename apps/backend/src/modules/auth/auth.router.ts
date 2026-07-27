import { Router, type IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { authController } from './auth.controller';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema';

const router: IRouter = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export default router;
