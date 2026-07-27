import { Router } from 'express';
import * as appController from '../controllers/app.controller';

const router = Router();

router.get('/stats', appController.getAppStats);

export default router;
