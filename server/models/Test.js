import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['Mock', 'Topic', 'Company', 'Contest'], default: 'Topic', index: true },

    // Settings
    duration: { type: Number, required: true }, // In minutes
    totalPoints: { type: Number, default: 0 },
    passingScore: { type: Number },
    showAnswers: { type: Boolean, default: true }, // Control immediate result visibility

    // Scheduling (for contests or limited time tests)
    startDate: { type: Date, index: true },
    endDate: { type: Date, index: true },

    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
}, {
    timestamps: true
});

// Index to find active tests
testSchema.index({ isActive: 1, isDeleted: 1 });
testSchema.index({ type: 1, isActive: 1 });

const Test = mongoose.model('Test', testSchema);

export default Test;
