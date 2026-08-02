import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/overview", adminController.getDashboardOverview);
router.get("/ai-usage", adminController.getAiUsageStats);
router.put("/users/:id/password", adminController.changeUserPassword);

export default router;
