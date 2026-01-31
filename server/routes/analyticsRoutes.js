import express from 'express';
import {
    getDashboardStats,
    getDailySnapshot,
    createSnapshot,
    getActivityLogs,
    getLeaderboard,
    getQuestionDifficultyReport,
    getTestAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/snapshot', getDailySnapshot);
router.post('/snapshot', createSnapshot); // Manual trigger
router.get('/activity', getActivityLogs);
router.get('/leaderboard', getLeaderboard);
router.get('/reports/questions', getQuestionDifficultyReport);
router.get('/tests/:testId', getTestAnalytics);

export default router;
