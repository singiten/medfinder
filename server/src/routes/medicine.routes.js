import { Router } from 'express';
import { createMedicine } from '../controllers/medicine.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', requireRole('admin'), createMedicine);

export default router;