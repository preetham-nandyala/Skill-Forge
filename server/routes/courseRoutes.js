import express from 'express';
import {
    getCourses, createCourse, updateCourse, deleteCourse,
    addLevel, updateLevel, deleteLevel,
    addModule, updateModule, deleteModule,
    addTopic, updateTopic, deleteTopic,
    addContent, updateContent, deleteContent
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminCheck } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public: Get all courses
router.route('/')
    .get(getCourses)
    .post(protect, adminCheck, createCourse);

// Admin-only operations for course mutation
router.route('/:id')
    .put(protect, adminCheck, updateCourse)
    .delete(protect, adminCheck, deleteCourse);

// Level (Nested under Course)
router.post('/:courseId/levels', protect, adminCheck, addLevel);
router.route('/levels/:id').put(protect, adminCheck, updateLevel).delete(protect, adminCheck, deleteLevel);

// Module (Nested under Level)
router.post('/levels/:levelId/modules', protect, adminCheck, addModule);
router.route('/modules/:id').put(protect, adminCheck, updateModule).delete(protect, adminCheck, deleteModule);

// Topic (Nested under Module)
router.post('/modules/:moduleId/topics', protect, adminCheck, addTopic);
router.route('/topics/:id').put(protect, adminCheck, updateTopic).delete(protect, adminCheck, deleteTopic);

// Content (Nested under Topic)
router.post('/topics/:topicId/contents', protect, adminCheck, addContent);
router.route('/contents/:id').put(protect, adminCheck, updateContent).delete(protect, adminCheck, deleteContent);

export default router;
