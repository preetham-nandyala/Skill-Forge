import express from 'express';
import { getUserActivity, getUserProgress } from '../controllers/userDashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/activity', getUserActivity);
router.get('/progress', getUserProgress);

export default router;
