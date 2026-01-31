import express from 'express';
const router = express.Router();
import Submission from '../models/Submission.js';
import { protect } from '../middleware/authMiddleware.js';

// @desc    Get user submissions
// @route   GET /api/submissions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('problem', 'title difficulty');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a new submission (Mock Execution for now)
// @route   POST /api/submissions
// @access  Private
router.post('/', protect, async (req, res) => {
    const { problemId, code, language } = req.body;

    // TODO: Send to Redis/Docker Queue here
    // For now, we simulate a random result for immediate feedback via API

    const randomStatus = Math.random() > 0.3 ? 'Accepted' : 'Wrong Answer';

    const submission = await Submission.create({
        user: req.user._id,
        problem: problemId,
        code,
        language,
        status: randomStatus,
        executionTime: Math.floor(Math.random() * 100),
        memoryUsed: Math.floor(Math.random() * 50000),
        passedTests: randomStatus === 'Accepted' ? 10 : 5,
        totalTests: 10,
        output: randomStatus === 'Accepted' ? 'All tests passed' : 'Output mismatch'
    });

    res.status(201).json(submission);
});

export default router;
