import { Router, type IRouter } from 'express';
import authRouter from '../modules/auth/auth.router';
import customerRouter from '../modules/customer/customer.router';
import healthRouter from './health';

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/customers', customerRouter);

export default router;
