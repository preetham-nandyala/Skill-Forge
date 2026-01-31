import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'video', 'interactive', 'pdf', 'code'],
        required: true
    },
    body: {
        type: String, // Markdown text or HTML
    },
    url: {
        type: String, // For video/pdf
    },
    duration: {
        type: Number, // Estimated minutes
        default: 0
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

const Content = mongoose.model('Content', contentSchema);

export default Content;
