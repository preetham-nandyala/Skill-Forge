import Course from '../models/Course.js';
import Level from '../models/Level.js';
import Module from '../models/Module.js';
import Topic from '../models/Topic.js';
import Content from '../models/Content.js';

// --- Courses ---
export const getCourses = async (req, res) => {
    const courses = await Course.find({ isDeleted: false })
        .populate({
            path: 'levels',
            populate: {
                path: 'modules',
                populate: {
                    path: 'topics',
                    populate: { path: 'contents' }
                }
            }
        });
    res.json(courses);
};

export const createCourse = async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
};

export const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (course) {
        course.isDeleted = true;
        course.deletedAt = new Date();
        await course.save();
        res.json({ message: 'Course soft deleted' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

// --- Levels ---
export const addLevel = async (req, res) => { // Course ID in params
    const { number, title, description } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const level = await Level.create({ number, title, description });
    course.levels.push(level._id);
    await course.save();
    res.status(201).json(level);
};

export const updateLevel = async (req, res) => {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(level);
};

export const deleteLevel = async (req, res) => {
    const level = await Level.findById(req.params.id);
    if (level) {
        level.isDeleted = true;
        level.deletedAt = new Date();
        await level.save();
        // Optionally remove ref from Course or keep it to maintain history
        res.json({ message: 'Level soft deleted' });
    } else {
        res.status(404).json({ message: 'Level not found' });
    }
};

// --- Modules ---
export const addModule = async (req, res) => { // Level ID in params
    const { title, description, order } = req.body;
    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ message: 'Level not found' });

    const module = await Module.create({ title, description, order });
    level.modules.push(module._id);
    await level.save();
    res.status(201).json(module);
};

export const updateModule = async (req, res) => {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(module);
};

export const deleteModule = async (req, res) => {
    // Soft delete
    await Module.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Module deleted' });
};

// --- Topics ---
export const addTopic = async (req, res) => { // Module ID in params
    const { title, description, order } = req.body;
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const topic = await Topic.create({ title, description, order });
    module.topics.push(topic._id);
    await module.save();
    res.status(201).json(topic);
};

export const updateTopic = async (req, res) => {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(topic);
};

export const deleteTopic = async (req, res) => {
    await Topic.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Topic deleted' });
};

// --- Content ---
export const addContent = async (req, res) => { // Topic ID in params
    const { title, type, body, url, duration } = req.body;
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const content = await Content.create({ title, type, body, url, duration });
    topic.contents.push(content._id);
    await topic.save();
    res.status(201).json(content);
};

export const updateContent = async (req, res) => {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(content);
};

export const deleteContent = async (req, res) => {
    await Content.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Content deleted' });
};
