import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { validate } from '../middlewares/validate';
import { protect } from '../middlewares/authMiddleware';
import { createTripSchema } from '../validations/trip.validation';

const router = Router();

// All trip routes require authentication
router.use(protect);

router.post('/parse-prompt', tripController.parsePrompt);
router.post('/generate', validate(createTripSchema), tripController.generate);
router.get('/', tripController.getMyTrips);
router.get('/:id', tripController.getTrip);

export default router;


