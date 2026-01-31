import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    strictEndTime: { // Hard stop for contests
        type: Date
    },
    score: {
        type: Number,
        default: 0
    },
    accuracy: { // Percentage
        type: Number,
        default: 0
    },
    timeTaken: { // In Seconds
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'timed-out'],
        default: 'in-progress',
        index: true
    },
    isAgreedToRules: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

export default TestAttempt;
