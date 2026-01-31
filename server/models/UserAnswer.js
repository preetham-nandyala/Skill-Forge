import mongoose from 'mongoose';

const userAnswerSchema = new mongoose.Schema({
    attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true,
        index: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedOptionId: { // For MCQs
        type: mongoose.Schema.Types.ObjectId
    },
    answerText: { // For Text/Code
        type: String
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    timeTaken: { // Seconds
        type: Number
    }
}, {
    timestamps: true
});

const UserAnswer = mongoose.model('UserAnswer', userAnswerSchema);

export default UserAnswer;
