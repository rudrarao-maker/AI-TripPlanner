import { Router } from 'express';
import * as bookingController from './booking.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/:tripId', bookingController.getBookings);
router.post('/', bookingController.createBooking);

export default router;
