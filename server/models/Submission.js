import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: 'javascript'
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Pending'],
        default: 'Pending',
    },
    output: { type: String },
    executionTime: { type: Number }, // in ms
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
