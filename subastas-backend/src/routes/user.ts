import { Router } from 'express';
import { getMe, addPaymentMethod, getUserBids } from '../controllers/user';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.post('/me/payment-methods', addPaymentMethod);
router.get('/me/bids', getUserBids);

export default router;
