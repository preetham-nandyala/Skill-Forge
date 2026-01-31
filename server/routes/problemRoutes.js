import express from 'express';
const router = express.Router();
import { getProblems, getProblemById } from '../controllers/problemController.js';

router.get('/', getProblems);
router.get('/:id', getProblemById);

export default router;
