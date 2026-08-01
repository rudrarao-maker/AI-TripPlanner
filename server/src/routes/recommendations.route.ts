import { Router } from "express";
import {
  getHotels,
  getRestaurants,
  getAttractions,
  getTransport,
} from "../controllers/recommendations.controller";

const router = Router();

router.get("/hotels", getHotels);
router.get("/restaurants", getRestaurants);
router.get("/attractions", getAttractions);
router.get("/transport", getTransport);

export default router;
