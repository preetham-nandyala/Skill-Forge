import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    permissions: [{
        type: String, // e.g., 'manage_users', 'manage_content', 'view_analytics'
    }],
    lastLogin: {
        type: Date
    },
    managedSections: [{
        type: String // e.g., 'Contests', 'Courses'
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

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
