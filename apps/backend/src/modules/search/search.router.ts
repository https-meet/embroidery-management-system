import { Router, type IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { searchController } from './search.controller';

const router: IRouter = Router();

router.use(authenticate);

router.get('/', searchController.search);

export default router;
