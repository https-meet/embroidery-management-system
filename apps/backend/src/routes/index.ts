import { Router, type IRouter } from 'express';
import authRouter from '../modules/auth/auth.router';
import healthRouter from './health';

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
