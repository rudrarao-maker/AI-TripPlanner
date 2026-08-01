import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.get("/admin/all", restrictTo("admin"), bookingController.getAllBookings);
router.get("/", bookingController.getBookings);
router.get("/:tripId", bookingController.getBookings);
router.post("/", bookingController.createBooking);

export default router;
