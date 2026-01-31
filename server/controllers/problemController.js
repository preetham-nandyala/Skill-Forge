import Problem from '../models/Problem.js';

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
    const problems = await Problem.find({});
    res.json(problems);
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
export const getProblemById = async (req, res) => {
    const problem = await Problem.findById(req.params.id);

    if (problem) {
        res.json(problem);
    } else {
        res.status(404).json({ message: 'Problem not found' });
    }
};
