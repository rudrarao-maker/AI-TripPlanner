import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as tripController from "../controllers/trip.controller";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/authMiddleware";
import { createTripSchema } from "../validations/trip.validation";

const router = Router();

// All trip routes require authentication
router.use(protect);

// Limit each IP to 50 AI generations per hour (frontend sends 3 per trip generation)
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, 
  message: { error: "Too many trips generated from this IP, please try again after an hour. This protects our AI resources." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/parse-prompt", tripController.parsePrompt);
router.post("/generate", validate(createTripSchema), generateLimiter, tripController.generate);
router.get("/", tripController.getMyTrips);
router.get("/:id", tripController.getTrip);
router.post("/:id/days/:dayId/regenerate", tripController.regenerateDay);
router.get("/:id/activities/:activityId/alternatives", tripController.getAlternativeActivity);

export default router;
