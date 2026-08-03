import { Router, type IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { loginRateLimiter } from '../../middleware/authRateLimiter';
import { validateRequest } from '../../middleware/validateRequest';
import { authController } from './auth.controller';
import { changePasswordSchema, loginSchema, refreshTokenSchema } from './auth.schema';

const router: IRouter = Router();

router.post('/login', loginRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refresh);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export default router;
