import express from 'express';
import {
    startTest,
    getTestQuestions,
    saveAnswer,
    submitTest,
    getTestResults
} from '../controllers/testExecutionController.js';
import { getTests } from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTests); // List available tests

router.post('/:testId/start', startTest);
router.get('/:testId/questions', getTestQuestions); // Returns questions + saved state
router.post('/:testId/answer', saveAnswer);
router.post('/:testId/submit', submitTest);
router.get('/:testId/results', getTestResults);

export default router;
