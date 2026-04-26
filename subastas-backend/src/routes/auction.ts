import { Router } from 'express';
import { getAvailableAuctions, getAuctionCatalog, adminCreateAuction } from '../controllers/auction';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAvailableAuctions);
router.get('/:id/catalog', authenticate, getAuctionCatalog);

// Admin / Simulation
router.post('/admin', adminCreateAuction);

export default router;
