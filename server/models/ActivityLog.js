import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., 'LOGIN', 'TEST_START', 'SUBMISSION'
        required: true,
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed // Flexible JSON data
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// TTL Index for auto-cleanup (optional, but good for logs) - asking helper to not auto-delete indefinitely unless requested? 
// Prompt says "Indexes for time-based queries". I will add standard index.
activityLogSchema.index({ timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
