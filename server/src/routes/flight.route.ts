import { Router } from "express";
import { searchFlights } from "../controllers/flight.controller";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Allow public flight search or restrict to logged in users based on requirement
// We'll restrict to logged in users for now
router.use(protect);

router.get("/search", searchFlights);

export default router;
