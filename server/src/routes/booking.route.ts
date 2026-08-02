import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { protect, restrictTo } from "../middlewares/authMiddleware";

import { validate } from "../middlewares/validate";
import { createBookingSchema } from "../validations/booking.validation";

const router = Router();

router.use(protect);

router.get("/admin/all", restrictTo("admin"), bookingController.getAllBookings);
router.get("/", bookingController.getBookings);
router.get("/:tripId", bookingController.getBookings);
router.post("/", validate(createBookingSchema), bookingController.createBooking);

export default router;
