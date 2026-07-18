import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.post('/message', chatController.chatWithAI);

export default router;


