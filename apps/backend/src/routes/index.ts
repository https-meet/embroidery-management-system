import { Router, type IRouter } from 'express';
import authRouter from '../modules/auth/auth.router';
import customerRouter from '../modules/customer/customer.router';
import designRouter from '../modules/design/design.router';
import jobRouter from '../modules/job/job.router';
import productionRouter from '../modules/production/production.router';
import healthRouter from './health';

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/customers', customerRouter);
router.use('/designs', designRouter);
router.use('/jobs', jobRouter);
router.use('/orders', jobRouter);
router.use('/production', productionRouter);

export default router;
