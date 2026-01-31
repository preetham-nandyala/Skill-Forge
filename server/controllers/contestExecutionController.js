import Contest from '../models/Contest.js';
import Registration from '../models/Registration.js';

// @desc    Register for a upcoming contest
// @route   POST /api/contests/:id/register
export const registerForContest = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(id);
    if (!contest) {
        return res.status(404).json({ message: 'Contest not found' });
    }

    const now = new Date();

    // Check Registration Window
    if (contest.registrationStartTime && now < contest.registrationStartTime) {
        return res.status(400).json({ message: 'Registration has not started yet' });
    }
    if (contest.registrationEndTime && now > contest.registrationEndTime) {
        return res.status(400).json({ message: 'Registration has closed' });
    }

    // Check existing registration
    const existingReg = await Registration.findOne({ userId, contestId: id });
    if (existingReg) {
        return res.status(400).json({ message: 'Already registered' });
    }

    const registration = await Registration.create({
        userId,
        contestId: id,
        status: 'registered'
    });

    res.status(201).json({ message: 'Registration successful', registration });
};

// @desc    Check registration status
// @route   GET /api/contests/:id/status
export const getMyRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({ userId, contestId: id });
    // Also return contest timings for client convenience
    const contest = await Contest.findById(id).select('startTime endTime status');

    res.json({
        isRegistered: !!registration,
        registration,
        contest
    });
};
