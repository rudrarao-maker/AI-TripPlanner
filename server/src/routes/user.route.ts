import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin only route
router.get('/', restrictTo('admin'), userController.getAllUsers);

export default router;


