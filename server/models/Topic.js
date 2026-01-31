import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    contents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }],
    order: {
        type: Number,
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

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
