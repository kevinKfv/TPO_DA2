import { Router } from 'express';
import { submitItem, adminReviewItem } from '../controllers/item';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, submitItem);

// Admin / Simulation
router.post('/admin/:id/review', adminReviewItem);

export default router;
