import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    subjectId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    }, // e.g., 'react', 'java'
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
    },
    icon: {
        type: String // Emoji or URL
    },
    color: {
        type: String
    },
    levels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level'
    }],
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

const Course = mongoose.model('Course', courseSchema);

export default Course;
