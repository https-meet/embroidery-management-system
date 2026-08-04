import { Router, type IRouter } from 'express';
import authRouter from '../modules/auth/auth.router';
import customerRouter from '../modules/customer/customer.router';
import dashboardRouter from '../modules/dashboard/dashboard.router';
import designRouter from '../modules/design/design.router';
import invoiceRouter from '../modules/invoice/invoice.router';
import jobRouter from '../modules/job/job.router';
import materialRouter from '../modules/materials/material.router';
import paymentRouter from '../modules/payment/payment.router';
import productionRouter from '../modules/production/production.router';
import purchaseRouter from '../modules/purchases/purchase.router';
import reportRouter from '../modules/report/report.router';
import searchRouter from '../modules/search/search.router';
import settingsRouter from '../modules/settings/settings.router';
import supplierRouter from '../modules/suppliers/supplier.router';
import userRouter from '../modules/users/users.router';
import healthRouter from './health';

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/customers', customerRouter);
router.use('/designs', designRouter);
router.use('/jobs', jobRouter);
router.use('/orders', jobRouter);
router.use('/production', productionRouter);
router.use('/invoices', invoiceRouter);
router.use('/payments', paymentRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportRouter);
router.use('/search', searchRouter);
router.use('/settings', settingsRouter);
router.use('/materials', materialRouter);
router.use('/suppliers', supplierRouter);
router.use('/purchases', purchaseRouter);

export default router;
