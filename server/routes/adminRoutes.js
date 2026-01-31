import express from 'express';
const router = express.Router();
import {
    getUsers, deleteUser, getProblems, createProblem, updateProblem
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminCheck } from '../middleware/adminMiddleware.js';

import courseRoutes from './courseRoutes.js';
import testRoutes from './testRoutes.js';
import contestRoutes from './contestRoutes.js';
import questionRoutes from './questionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

router.use(protect);
router.use(adminCheck);

// User Management
router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

// Problem Management (Legacy/Simple)
router.route('/problems')
    .get(getProblems)
    .post(createProblem);

router.route('/problems/:id')
    .put(updateProblem);

// Modular Admin Routes
router.use('/courses', courseRoutes);
router.use('/tests', testRoutes);
router.use('/contests', contestRoutes);
router.use('/questions', questionRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
