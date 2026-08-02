import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { protect, restrictTo } from "../middlewares/authMiddleware";

import { validate } from "../middlewares/validate";
import { updateProfileSchema, createUserSchema, updateUserSchema } from "../validations/user.validation";

const router = Router();

router.use(protect);

router.get("/profile", userController.getProfile);
router.put("/profile", validate(updateProfileSchema), userController.updateProfile);

// Admin only routes
router.use("/", restrictTo("admin"));
router.get("/", userController.getAllUsers);
router.post("/", validate(createUserSchema), userController.createUser);

// Bulk operations (must be before /:id to avoid route conflicts)
router.post("/bulk", userController.bulkCreateUsers);
router.put("/bulk", userController.bulkUpdateUsers);
router.delete("/bulk", userController.bulkDeleteUsers);

// Single user operations
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
