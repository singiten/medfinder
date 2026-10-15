import { Router } from 'express';
import { createMedicine, searchMedicines } from '../controllers/medicine.controller.js';
import { requireRole } from '../middleware/requireRole.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/search', searchMedicines);
router.post('/', authenticate, requireRole('admin'), createMedicine);

export default router;