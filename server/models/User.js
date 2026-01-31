import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        index: true
    },
    profile: {
        bio: { type: String, maxlength: 500 },
        avatar: { type: String }, // URL
        socialLinks: {
            github: { type: String },
            linkedin: { type: String },
            twitter: { type: String },
            website: { type: String }
        },
        location: { type: String },
        website: { type: String }
    },
    stats: {
        problemsSolved: { type: Number, default: 0 },
        testsTaken: { type: Number, default: 0 },
        xp: { type: Number, default: 0, index: true },
        currentStreak: { type: Number, default: 0 },
        lastActive: { type: Date }
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

// Indexes for common queries
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.xp': -1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
