import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Course from '../models/Course.js';
import Test from '../models/Test.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Get all problems
// @route   GET /api/admin/problems
// @access  Private/Admin
export const getProblems = async (req, res) => {
    const problems = await Problem.find({});
    res.json(problems);
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Create a new problem
// @route   POST /api/admin/problems
// @access  Private/Admin
export const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, examples, testCases, starterCode, solutionCode } = req.body;

    const problem = new Problem({
        title,
        description,
        difficulty,
        tags,
        examples,
        testCases,
        starterCode,
        solutionCode
    });

    const createdProblem = await problem.save();
    res.status(201).json(createdProblem);
};

// @desc    Update problem
// @route   PUT /api/admin/problems/:id
// @access  Private/Admin
export const updateProblem = async (req, res) => {
    const problem = await Problem.findById(req.params.id);

    if (problem) {
        // Generic update for all top-level fields
        Object.assign(problem, req.body);

        const updatedProblem = await problem.save();
        res.json(updatedProblem);
    } else {
        res.status(404).json({ message: 'Problem not found' });
    }
};

// --- Tests ---
export const getTests = async (req, res) => {
    const tests = await Test.find({});
    res.json(tests);
};

export const createTest = async (req, res) => {
    const test = await Test.create(req.body);
    if (test) res.status(201).json(test);
    else res.status(400).json({ message: 'Invalid test data' });
};

export const deleteTest = async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (test) {
        await test.deleteOne();
        res.json({ message: 'Test removed' });
    } else {
        res.status(404).json({ message: 'Test not found' });
    }
};

// --- Courses ---
export const getCourses = async (req, res) => {
    const courses = await Course.find({});
    res.json(courses);
};

export const createCourse = async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    Object.assign(course, req.body);
    const updatedCourse = await course.save();
    res.json(updatedCourse);
};
