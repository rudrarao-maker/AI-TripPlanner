import { Router } from "express";
import * as expenseController from "../controllers/expense.controller";
import { protect } from "../middlewares/authMiddleware";

import { validate } from "../middlewares/validate";
import { createExpenseSchema } from "../validations/expense.validation";

const router = Router();

router.use(protect);

router.get("/:tripId", expenseController.getExpenses);
router.post("/", validate(createExpenseSchema), expenseController.addExpense);

export default router;
