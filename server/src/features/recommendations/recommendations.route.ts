import { Router } from 'express';
import * as recController from './recommendations.controller';

const router = Router();

router.get('/hotels', recController.getHotels);
router.get('/restaurants', recController.getRestaurants);
router.get('/attractions', recController.getAttractions);

export default router;
