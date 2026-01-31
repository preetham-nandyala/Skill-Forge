import express from 'express';
import {
    getContests, createContest, updateContest, deleteContest, getContestStats
} from '../controllers/contestController.js';

const router = express.Router();

router.route('/')
    .get(getContests)
    .post(createContest);

router.route('/:id')
    .put(updateContest) // Schedule modification is just a PUT with new dates
    .delete(deleteContest);

router.get('/:id/stats', getContestStats);

export default router;
