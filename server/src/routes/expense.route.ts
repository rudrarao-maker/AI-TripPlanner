import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/:tripId', expenseController.getExpenses);
router.post('/', expenseController.addExpense);

export default router;


