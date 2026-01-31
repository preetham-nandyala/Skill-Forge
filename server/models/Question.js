import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['MCQ', 'CODE', 'TEXT'],
        default: 'MCQ'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
        index: true
    },
    options: [optionSchema], // For MCQs
    correctAnswer: { type: String }, // For text/code answers if simple check needed, or logic elsewhere

    // Versioning
    version: {
        type: Number,
        default: 1,
        index: true
    },
    parentQuestionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        index: true
    },
    isLatest: {
        type: Boolean,
        default: true,
        index: true
    },

    // Metadata
    tags: [{ type: String, index: true }],
    points: { type: Number, default: 1 },

    stats: {
        attempts: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        averageTime: { type: Number, default: 0 } // seconds
    },

    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficiently fetching questions by version/parent
questionSchema.index({ parentQuestionId: 1, version: -1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
