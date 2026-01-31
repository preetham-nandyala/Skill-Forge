import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/emailService.js';



const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password, // Hashed in model pre-save
    });

    if (user) {
        // Send Welcome Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to ProAlgo Platform!',
                message: `Hi ${user.name},\n\nWelcome to ProAlgo! We are excited to have you on board using MERN Stack learning platform.\n\nStart exploring courses and practicing problems now!\n\nBest Regards,\nProAlgo Team`,
                html: `<h1>Welcome to ProAlgo, ${user.name}!</h1><p>We are excited to have you on board.</p><p>Start exploring <a href="http://localhost:3000/learning">courses</a> and <a href="http://localhost:3000/practice">practicing problems</a> now!</p>`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // We don't fail registration if email fails, just log it
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Check if user is in admin allowlist to auto-grant privileges
        // Legacy check removed - Admin access is now managed solely via database role

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            stats: user.stats
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            stats: updatedUser.stats
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const sendTestEmail = async (req, res) => {
    const { email } = req.body;
    try {
        await sendEmail({
            email: email,
            subject: 'Test Email from ProAlgo',
            message: 'This is a test email to verify your Brevo configuration.',
            html: '<h1>Brevo Configured!</h1><p>Your email service is working correctly.</p>'
        });
        res.status(200).json({ message: 'Test email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Email failed to send', error: error.message });
    }
};
