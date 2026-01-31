import User from '../models/User.js';
import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import AnalyticsSnapshot from '../models/AnalyticsSnapshot.js';
import ActivityLog from '../models/ActivityLog.js';
import Question from '../models/Question.js';
import TestQuestion from '../models/TestQuestion.js';

export const getDashboardStats = async (req, res) => {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeTests = await Test.countDocuments({ isActive: true, isDeleted: false });
    const totalAttempts = await TestAttempt.countDocuments();

    // Calculate simple trends or averages if needed
    const recentAttempts = await TestAttempt.find().sort('-createdAt').limit(5).populate('userId', 'name');

    res.json({
        totalUsers,
        activeTests,
        totalAttempts,
        recentAttempts
    });
};

export const getDailySnapshot = async (req, res) => {
    // Return last 7 snapshots
    const snapshots = await AnalyticsSnapshot.find().sort('-date').limit(7);
    res.json(snapshots);
};

// Allow manual trigger of snapshot creation (usually a cron job)
export const createSnapshot = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
        activeUsers: await User.countDocuments({ updatedAt: { $gte: today } }), // Rough estimate
        newRegistrations: await User.countDocuments({ createdAt: { $gte: today } }),
        testsTaken: await TestAttempt.countDocuments({ createdAt: { $gte: today } }),
    };

    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
        { date: today },
        { metrics: stats },
        { upsert: true, new: true }
    );

    res.json(snapshot);
};

// Activity Logs
export const logActivity = async (userId, action, details, req) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            details,
            ipAddress: req?.ip,
            userAgent: req?.get('User-Agent')
        });
    } catch (error) {
        console.error('Activity Log Error:', error);
    }
};

export const getActivityLogs = async (req, res) => {
    const logs = await ActivityLog.find().sort('-createdAt').limit(50).populate('userId', 'name email');
    res.json(logs);
};

// Leaderboard
export const getLeaderboard = async (req, res) => {
    const { type, timeframe } = req.query; // e.g., type=xp, timeframe=weekly

    // Simple global leaderboard based on total score/xp
    const leaderboard = await User.find({ isDeleted: false })
        .sort({ 'stats.xp': -1 }) // Assuming XP is the main metric
        .limit(20)
        .select('name profile.avatar stats');

    res.json(leaderboard);
};

// Question Difficulty Report
export const getQuestionDifficultyReport = async (req, res) => {
    // Find questions with high usage but low accuracy
    // Assuming 'stats' in Question model is populated
    const questions = await Question.find({ 'stats.attempts': { $gt: 5 } })
        .sort('stats.correct') // Sort by lowest correct count (raw number, better would be percentage)
        .limit(20)
        .select('text difficulty stats type');

    const report = questions.map(q => {
        const accuracy = q.stats.attempts > 0 ? (q.stats.correct / q.stats.attempts * 100) : 0;
        return {
            ...q.toObject(),
            calculatedAccuracy: accuracy.toFixed(2) + '%'
        };
    });

    res.json(report);
};

// Test-Level Analytics
export const getTestAnalytics = async (req, res) => {
    const { testId } = req.params;

    const attempts = await TestAttempt.find({ testId, status: 'completed' });
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) return res.json({ message: 'No data' });

    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts;
    const avgTime = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / totalAttempts;

    // TODO: Question breakdown for this specific test
    // We would need to aggregate UserAnswers for this testId

    res.json({
        totalAttempts,
        avgScore,
        avgTime
    });
};
