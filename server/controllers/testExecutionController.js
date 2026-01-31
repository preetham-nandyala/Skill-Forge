import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import TestQuestion from '../models/TestQuestion.js';
import UserAnswer from '../models/UserAnswer.js';
import Question from '../models/Question.js';
import Contest from '../models/Contest.js';
import Registration from '../models/Registration.js';

// Helper to check time validity
const isAttemptExpired = (attempt, test) => {
    // If strict end time was set on attempt (for contest hard stop)
    if (attempt.strictEndTime) {
        return Date.now() > (new Date(attempt.strictEndTime).getTime() + 1 * 60 * 1000); // 1 min buffer
    }

    const startTime = new Date(attempt.startTime).getTime();
    const durationMs = test.duration * 60 * 1000;
    const now = Date.now();
    // 2 minutes buffer for latency
    return now > (startTime + durationMs + 2 * 60 * 1000);
};

// @desc    Start a test attempt
// @route   POST /api/tests/:testId/start
export const startTest = async (req, res) => {
    const { testId } = req.params;
    const userId = req.user._id;

    const test = await Test.findById(testId);
    if (!test || !test.isActive || test.isDeleted) {
        return res.status(404).json({ message: 'Test not found or inactive' });
    }

    const now = new Date();
    let strictEndTime = null;

    // --- CONTEST LOGIC ---
    if (test.type === 'Contest') {
        const contest = await Contest.findOne({ testId });
        if (!contest) {
            return res.status(500).json({ message: 'Contest configuration missing' });
        }

        // 1. Check Registration
        const registration = await Registration.findOne({ userId, contestId: contest._id });
        if (!registration) {
            return res.status(403).json({ message: 'You are not registered for this contest' });
        }

        // 2. Check Contest Times
        if (now < contest.startTime) {
            return res.status(403).json({ message: 'Contest has not started yet' });
        }
        if (now > contest.endTime) {
            return res.status(403).json({ message: 'Contest has ended' });
        }

        // 3. Mark participation
        if (registration.status === 'registered') {
            registration.status = 'participated';
            await registration.save();
        }

        // 4. Calculate Hard Stop (Auto-close contest tests)
        // Attempt duration cannot exceed contest end time
        const timeRemainingInContest = contest.endTime.getTime() - now.getTime(); // ms
        const testDurationMs = test.duration * 60 * 1000;

        // If remaining time is less than full duration, clamp it
        if (timeRemainingInContest < testDurationMs) {
            strictEndTime = contest.endTime;
        }
    } else {
        // Standard Test Dates
        if (test.startDate && now < test.startDate) {
            return res.status(403).json({ message: 'Test has not started yet' });
        }
        if (test.endDate && now > test.endDate) {
            return res.status(403).json({ message: 'Test has ended' });
        }
    }

    // Check for existing incomplete attempt
    let attempt = await TestAttempt.findOne({
        testId,
        userId,
        status: 'in-progress'
    });

    if (attempt) {
        if (isAttemptExpired(attempt, test)) {
            attempt.status = 'timed-out';
            attempt.endTime = new Date(attempt.startTime.getTime() + test.duration * 60000);
            await attempt.save();
            return res.status(400).json({ message: 'Previous attempt expired', attempt });
        }

        // Recalculate remaining seconds for client
        const effectiveEnd = attempt.strictEndTime || new Date(attempt.startTime.getTime() + test.duration * 60000);
        const remainingSeconds = Math.max(0, Math.floor((new Date(effectiveEnd).getTime() - now.getTime()) / 1000));

        // Return existing active attempt
        return res.json({
            message: 'Resuming test',
            attempt,
            duration: Math.ceil(remainingSeconds / 60) // approx minutes for UI
        });
    }

    // Check max attempts if necessary (assumed 1 per contest/test for now unless specified)
    // const existingAttempts = await TestAttempt.countDocuments({ testId, userId });

    // Create new attempt
    attempt = await TestAttempt.create({
        testId,
        userId,
        startTime: now,
        endTime: null, // Set when finished
        status: 'in-progress',
        strictEndTime // Save the hard stop time if exists
    });

    res.status(201).json({ message: 'Test started', attempt, duration: test.duration });
};

// @desc    Get questions for the active attempt
// @route   GET /api/tests/:testId/questions
export const getTestQuestions = async (req, res) => {
    // Verify user has an active attempt
    const attempt = await TestAttempt.findOne({
        testId: req.params.testId,
        userId: req.user._id,
        status: 'in-progress'
    });

    if (!attempt) {
        return res.status(403).json({ message: 'No active attempt found. Start the test first.' });
    }

    // Fetch questions via TestQuestion map
    const testQuestions = await TestQuestion.find({ testId: req.params.testId })
        .sort('order')
        .populate({
            path: 'questionId',
            select: '-correctAnswer -stats' // Hide answers
        });

    // Also fetch saved answers to restore state
    const savedAnswers = await UserAnswer.find({ attemptId: attempt._id });

    // Map to a cleaner format
    const response = testQuestions.map(tq => {
        const q = tq.questionId;
        const saved = savedAnswers.find(sa => sa.questionId.toString() === q._id.toString());
        return {
            _id: q._id,
            text: q.text,
            type: q.type,
            options: q.options ? q.options.map(o => ({ _id: o._id, text: o.text })) : [], // Hide isCorrect
            points: tq.points,
            savedAnswer: saved ? (saved.selectedOptionId || saved.answerText) : null
        };
    });

    res.json({ questions: response, startTime: attempt.startTime });
};

// @desc    Submit a single answer (Auto-save)
// @route   POST /api/tests/:testId/answer
export const saveAnswer = async (req, res) => {
    const { questionId, selectedOptionId, answerText } = req.body;
    const { testId } = req.params;
    const userId = req.user._id;

    const attempt = await TestAttempt.findOne({ testId, userId, status: 'in-progress' });
    if (!attempt) return res.status(403).json({ message: 'Attempt not active or finished' });

    const test = await Test.findById(testId);
    if (isAttemptExpired(attempt, test)) {
        attempt.status = 'timed-out';
        attempt.endTime = new Date(); // Or logical end time
        await attempt.save();
        return res.status(403).json({ message: 'Time expired' });
    }

    // Upsert answer
    let updateData = {
        attemptId: attempt._id,
        questionId,
        selectedOptionId: selectedOptionId || null,
        answerText: answerText || null
    };

    // Calculate correctness immediately (Auto-Evaluate)
    const question = await Question.findById(questionId);
    if (question) {
        if (question.type === 'MCQ' && selectedOptionId) {
            const correctOpt = question.options.find(o => o.isCorrect);
            updateData.isCorrect = correctOpt && correctOpt._id.toString() === selectedOptionId;
        } else if (question.type === 'MCQ' && !selectedOptionId) {
            updateData.isCorrect = false; // Deselected
        }
        // TODO: Add simple string match for text/code if provided in correctAnswer
        if (question.type !== 'MCQ' && question.correctAnswer && answerText) {
            updateData.isCorrect = question.correctAnswer.trim() === answerText.trim();
        }
    }

    const saved = await UserAnswer.findOneAndUpdate(
        { attemptId: attempt._id, questionId },
        updateData,
        { upsert: true, new: true }
    );

    res.json({ message: 'Saved', savedId: saved._id });
};

// @desc    Submit test and finish
// @route   POST /api/tests/:testId/submit
export const submitTest = async (req, res) => {
    const { testId } = req.params;
    const userId = req.user._id;

    const attempt = await TestAttempt.findOne({ testId, userId, status: 'in-progress' });
    if (!attempt) return res.status(400).json({ message: 'No active attempt' });

    // Calculate Score & Accuracy
    const answers = await UserAnswer.find({ attemptId: attempt._id }).populate('questionId');
    const testQuestions = await TestQuestion.find({ testId });

    let totalScore = 0;
    let correctCount = 0;

    // Process answers
    const processedAnswersPromises = answers.map(async (ans) => {
        const tq = testQuestions.find(t => t.questionId.toString() === ans.questionId._id.toString());
        const points = tq ? tq.points : 1;

        if (ans.isCorrect) {
            totalScore += points;
            correctCount += 1;
            ans.pointsAwarded = points;
            await ans.save();
        }
        return ans;
    });

    await Promise.all(processedAnswersPromises);

    // Calculate Time Taken
    const now = new Date();
    const startTime = new Date(attempt.startTime);
    const timeTakenSeconds = Math.floor((now - startTime) / 1000);

    // Calculate Accuracy
    const totalQuestions = testQuestions.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Finalize Attempt
    attempt.status = 'completed';
    attempt.endTime = now;
    attempt.score = totalScore;
    attempt.accuracy = Math.round(accuracy * 100) / 100; // Round to 2 decimal
    attempt.timeTaken = timeTakenSeconds;

    await attempt.save();

    res.json({ message: 'Test submitted', score: totalScore, status: 'completed' });
};

// @desc    Get detailed results (with answer visibility control)
// @route   GET /api/tests/:testId/results
export const getTestResults = async (req, res) => {
    const { testId } = req.params;
    const userId = req.user._id;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const attempt = await TestAttempt.findOne({
        testId,
        userId,
        status: { $in: ['completed', 'timed-out'] }
    }).sort('-createdAt'); // Latest completed attempt

    if (!attempt) {
        return res.status(404).json({ message: 'No completed attempt found' });
    }

    // Determine Visibility
    let showDetails = test.showAnswers; // Default from test setting

    // If contest, override based on contest rules (e.g., hidden until contest ends)
    if (test.type === 'Contest') {
        const contest = await Contest.findOne({ testId });
        if (contest && new Date() < contest.endTime) {
            showDetails = false; // Hide during contest
        } else {
            showDetails = true; // Show after contest ends
        }
    }

    // Fetch User Answers
    const answers = await UserAnswer.find({ attemptId: attempt._id })
        .populate({
            path: 'questionId',
            select: showDetails ? '' : '-correctAnswer -options.isCorrect'
            // If showing details, select everything. If not, exclude answer keys.
        });

    res.json({
        attempt,
        answers: answers,
        showDetails
    });
};
