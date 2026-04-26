import { Router } from 'express';
import { registerStage1, registerStage2, mockAdminVerifyUser, login } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register/stage1', registerStage1);
router.post('/register/stage2', authenticate, registerStage2);
router.post('/login', login);

// Admin / Simulation
router.post('/admin/verify-user', mockAdminVerifyUser);

export default router;
