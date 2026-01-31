import Question from '../models/Question.js';
import UserAnswer from '../models/UserAnswer.js';

// @desc    Get all questions (latest versions only by default)
// @route   GET /api/admin/questions
export const getQuestions = async (req, res) => {
    const { keyword, difficulty, tags } = req.query;
    const query = { isLatest: true, isDeleted: false };

    if (keyword) {
        query.text = { $regex: keyword, $options: 'i' };
    }
    if (difficulty) {
        query.difficulty = difficulty;
    }
    if (tags) {
        query.tags = { $in: tags.split(',') };
    }

    const questions = await Question.find(query).sort('-createdAt');
    res.json(questions);
};

// @desc    Get single question
// @route   GET /api/admin/questions/:id
export const getQuestionById = async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) res.status(404).json({ message: 'Question not found' });
    res.json(question);
};

// @desc    Create a new question
// @route   POST /api/admin/questions
export const createQuestion = async (req, res) => {
    const question = await Question.create(req.body);
    res.status(201).json(question);
};

// @desc    Update question (Creates new version)
// @route   PUT /api/admin/questions/:id
export const updateQuestion = async (req, res) => {
    const { text, options, correctAnswer, difficulty, tags, points, type } = req.body;
    const oldQuestion = await Question.findById(req.params.id);

    if (!oldQuestion) {
        return res.status(404).json({ message: 'Question not found' });
    }

    // 1. Archive old version
    oldQuestion.isLatest = false;
    await oldQuestion.save();

    // 2. Create new version
    const newVersion = oldQuestion.version + 1;
    const parentId = oldQuestion.parentQuestionId || oldQuestion._id;

    const newQuestion = new Question({
        text: text || oldQuestion.text,
        type: type || oldQuestion.type,
        options: options || oldQuestion.options,
        correctAnswer: correctAnswer || oldQuestion.correctAnswer,
        difficulty: difficulty || oldQuestion.difficulty,
        tags: tags || oldQuestion.tags,
        points: points || oldQuestion.points,
        version: newVersion,
        parentQuestionId: parentId,
        isLatest: true,
        stats: oldQuestion.stats // Carry over stats? Usually no, separate stats per version might be cleaner, but user asked for "per-question". 
        // Accuracy stats usually apply to the logic. If logic changes, stats reset. 
        // Let's reset stats for the new version to allow tracking impact of changes.
    });

    const createdQuestion = await newQuestion.save();
    res.status(201).json(createdQuestion);
};

// @desc    Delete question (Soft delete)
// @route   DELETE /api/admin/questions/:id
export const deleteQuestion = async (req, res) => {
    await Question.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Question deleted' });
};

// @desc    Get question usage history/versions
// @route   GET /api/admin/questions/:id/history
export const getQuestionHistory = async (req, res) => {
    const current = await Question.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Question not found' });

    const parentId = current.parentQuestionId || current._id;
    // Find all sharing the same parent (including the parent itself if it was v1)
    // Or simpler: find by parentQuestionId = X OR _id = X

    const history = await Question.find({
        $or: [
            { parentQuestionId: parentId },
            { _id: parentId }
        ]
    }).sort('-version');

    res.json(history);
};

// @desc    Recalculate stats for a question
// @route   POST /api/admin/questions/:id/stats
export const recalculateStats = async (req, res) => {
    const qId = req.params.id;

    // Aggregation to calc stats from UserAnswer
    const stats = await UserAnswer.aggregate([
        { $match: { questionId: new mongoose.Types.ObjectId(qId) } },
        {
            $group: {
                _id: '$questionId',
                attempts: { $sum: 1 },
                correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                avgTime: { $avg: '$timeTaken' }
            }
        }
    ]);

    if (stats.length > 0) {
        const { attempts, correct, avgTime } = stats[0];
        await Question.findByIdAndUpdate(qId, {
            'stats.attempts': attempts,
            'stats.correct': correct,
            'stats.averageTime': avgTime
        });
        res.json(stats[0]);
    } else {
        res.json({ message: 'No answers found to calculate stats' });
    }
};
