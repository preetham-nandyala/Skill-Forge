import express from 'express';
import {
    getQuestions, getQuestionById, createQuestion, updateQuestion,
    deleteQuestion, getQuestionHistory, recalculateStats
} from '../controllers/questionController.js';

const router = express.Router();

router.route('/')
    .get(getQuestions)
    .post(createQuestion);

router.route('/:id')
    .get(getQuestionById)
    .put(updateQuestion) // Creates new version
    .delete(deleteQuestion);

router.get('/:id/history', getQuestionHistory);
router.post('/:id/stats', recalculateStats);

export default router;
