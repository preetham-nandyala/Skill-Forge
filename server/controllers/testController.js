import Test from '../models/Test.js';
import TestQuestion from '../models/TestQuestion.js';
import Question from '../models/Question.js';

// --- Test Management ---
export const getTests = async (req, res) => {
    const tests = await Test.find({ isDeleted: false }).sort('-createdAt');
    res.json(tests);
};

export const getTestById = async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Fetch questions mapped to this test
    const testQuestions = await TestQuestion.find({ testId: test._id })
        .sort('order')
        .populate('questionId');

    res.json({ ...test.toObject(), questions: testQuestions });
};

export const createTest = async (req, res) => {
    // Determine duration based on question count if not provided? 
    // For now, accept duration from body or default.
    const { title, duration, type } = req.body;
    const test = await Test.create({
        ...req.body,
        duration: duration || 60, // Default 60 mins
    });
    res.status(201).json(test);
};

export const updateTest = async (req, res) => {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
};

export const deleteTest = async (req, res) => {
    await Test.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Test delete' });
};

export const cloneTest = async (req, res) => {
    const originalTest = await Test.findById(req.params.id);
    if (!originalTest) return res.status(404).json({ message: 'Test not found' });

    const newTest = new Test({
        ...originalTest.toObject(),
        _id: undefined,
        title: `${originalTest.title} (Copy)`,
        createdAt: undefined,
        updatedAt: undefined,
        isActive: false // Default to inactive when cloned
    });
    await newTest.save();

    // Clone TestQuestion mappings
    const originalMappings = await TestQuestion.find({ testId: originalTest._id });
    const newMappings = originalMappings.map(mapping => ({
        testId: newTest._id,
        questionId: mapping.questionId,
        order: mapping.order,
        points: mapping.points
    }));
    await TestQuestion.insertMany(newMappings);

    res.status(201).json(newTest);
};

// --- Question Mapping ---
export const addQuestionsToTest = async (req, res) => {
    const { testId } = req.params;
    const { questionIds } = req.body; // Array of Question IDs

    // Find highest order
    const lastQ = await TestQuestion.findOne({ testId }).sort('-order');
    let startOrder = lastQ ? lastQ.order + 1 : 1;

    const mappings = questionIds.map((qId, index) => ({
        testId,
        questionId: qId,
        order: startOrder + index
    }));

    await TestQuestion.insertMany(mappings);
    res.json({ message: 'Questions added' });
};

export const removeQuestionFromTest = async (req, res) => {
    // Expects TestQuestion ID or (testId, questionId)? 
    // Ideally we remove by mapping ID if we have it, or testId + questionId
    const { testId, questionId } = req.params;
    await TestQuestion.deleteOne({ testId, questionId });
    res.json({ message: 'Question removed from test' });
};

export const reorderQuestions = async (req, res) => {
    const { testId } = req.params;
    const { orders } = req.body; // Array of { questionId, order }

    // Bulk write for performance
    const operations = orders.map(({ questionId, order }) => ({
        updateOne: {
            filter: { testId, questionId },
            update: { order }
        }
    }));

    await TestQuestion.bulkWrite(operations);
    res.json({ message: 'Order updated' });
};

// --- Question CRUD (Direct) ---
export const createQuestion = async (req, res) => {
    const question = await Question.create(req.body);
    res.status(201).json(question);
};

export const updateQuestion = async (req, res) => {
    // If versioning needed, we might create new and archive old?
    // For simple edit:
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
};

export const deleteQuestion = async (req, res) => {
    await Question.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Question deleted' });
};
