import Contest from '../models/Contest.js';
import Registration from '../models/Registration.js';

export const getContests = async (req, res) => {
    const contests = await Contest.find({ isDeleted: false }).populate('testId');
    res.json(contests);
};

export const createContest = async (req, res) => {
    const contest = await Contest.create(req.body);
    res.status(201).json(contest);
};

export const updateContest = async (req, res) => {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contest);
};

export const deleteContest = async (req, res) => {
    await Contest.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Contest deleted' });
};

export const getContestStats = async (req, res) => {
    const { id } = req.params;
    const registrationCount = await Registration.countDocuments({ contestId: id });
    const participationCount = await Registration.countDocuments({ contestId: id, status: 'participated' });

    res.json({
        registrationCount,
        participationCount
    });
};
