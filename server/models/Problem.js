import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    tags: [{ type: String }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testCases: [testCaseSchema],
    starterCode: { type: String },
    solutionCode: { type: String }, // Hidden from user
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
