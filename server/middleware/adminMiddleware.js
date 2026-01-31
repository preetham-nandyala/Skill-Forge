

export const adminCheck = (req, res, next) => {
    // Strategy 1: Check Role (Database bit)
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    res.status(401).json({ message: 'Not authorized as an admin' });
};
