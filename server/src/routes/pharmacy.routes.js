import { Router } from 'express';
import { nearbyPharmacies } from '../controllers/pharmacy.controller.js';

const router = Router();

router.get('/nearby', nearbyPharmacies);

export default router;