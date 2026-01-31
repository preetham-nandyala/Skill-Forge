import mongoose from 'mongoose';

const analyticsSnapshotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true, // One snapshot per day/hour
        index: true
    },
    metrics: {
        activeUsers: { type: Number, default: 0 },
        newRegistrations: { type: Number, default: 0 },
        testsTaken: { type: Number, default: 0 },
        questionsSolved: { type: Number, default: 0 },
        averageTestScore: { type: Number, default: 0 }
    },
    breakdown: {
        type: mongoose.Schema.Types.Mixed // Flexible breakdown data
    }
}, {
    timestamps: true
});

// Time-based index
analyticsSnapshotSchema.index({ date: -1 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

export default AnalyticsSnapshot;
