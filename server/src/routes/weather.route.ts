import { Router } from "express";
import { getWeather } from "../controllers/weather.controller";

const router = Router();

// GET /api/v1/weather?lat=28.6139&lng=77.2090&location=New Delhi
router.get("/", getWeather);

export default router;
