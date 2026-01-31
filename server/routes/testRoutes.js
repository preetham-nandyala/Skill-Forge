import express from 'express';
import {
    getTests, getTestById, createTest, updateTest, deleteTest, cloneTest,
    addQuestionsToTest, removeQuestionFromTest, reorderQuestions,
    createQuestion, updateQuestion, deleteQuestion
} from '../controllers/testController.js';

const router = express.Router();

// Test Management
router.route('/')
    .get(getTests)
    .post(createTest);

router.route('/:id')
    .get(getTestById)
    .put(updateTest)
    .delete(deleteTest);

router.post('/:id/clone', cloneTest);

// Questions Management (Within Test)
router.post('/:testId/questions', addQuestionsToTest);
router.delete('/:testId/questions/:questionId', removeQuestionFromTest);
router.put('/:testId/questions/reorder', reorderQuestions);

// Global Question CRUD (if needed separately)
router.route('/questions/all').post(createQuestion);
router.route('/questions/:id')
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;
