import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.js';
import Problem from './models/Problem.js';
import Course from './models/Course.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
    }
];

const problems = [];
const courses = [];

const importData = async () => {
    try {
        await User.deleteMany();
        await Problem.deleteMany();
        await Course.deleteMany();

        await User.create(users);
        await Problem.create(problems);
        await Course.create(courses);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Problem.deleteMany();
        await Course.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
