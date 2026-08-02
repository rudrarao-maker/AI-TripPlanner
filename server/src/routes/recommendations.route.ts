import { Router } from "express";
import {
  getHotels,
  getRestaurants,
  getAttractions,
  getTransport,
} from "../controllers/recommendations.controller";
import { validate } from "../middlewares/validate";
import { getHotelsSchema, getRestaurantsSchema, getAttractionsSchema } from "../validations/recommendations.validation";

const router = Router();

router.get("/hotels", validate(getHotelsSchema), getHotels);
router.get("/restaurants", validate(getRestaurantsSchema), getRestaurants);
router.get("/attractions", validate(getAttractionsSchema), getAttractions);
router.get("/transport", getTransport);

export default router;
