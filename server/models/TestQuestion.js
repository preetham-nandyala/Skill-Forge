import mongoose from 'mongoose';

const testQuestionSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
        index: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Composite index to fetch questions for a test in order
testQuestionSchema.index({ testId: 1, order: 1 });

const TestQuestion = mongoose.model('TestQuestion', testQuestionSchema);

export default TestQuestion;
