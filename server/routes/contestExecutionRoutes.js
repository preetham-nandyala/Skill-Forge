import express from 'express';
import { registerForContest, getMyRegistrationStatus } from '../controllers/contestExecutionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/:id/register', registerForContest);
router.get('/:id/status', getMyRegistrationStatus);

export default router;
