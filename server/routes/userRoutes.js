import express from 'express';
const router = express.Router();
import { registerUser, authUser, getUserProfile, updateUserProfile, sendTestEmail } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.post('/test-email', sendTestEmail);

export default router;
