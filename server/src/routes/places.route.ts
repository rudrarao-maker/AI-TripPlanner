import express from 'express';
import { getNearbyPlaces } from '../controllers/places.controller';

const router = express.Router();

// Allow unauthenticated access for now so the frontend can easily fetch
router.get('/nearby', getNearbyPlaces);

export default router;
