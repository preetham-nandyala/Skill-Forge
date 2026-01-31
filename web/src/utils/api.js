import api from '../services/apiClient.js';

// Auth Services
export const login = (data) => api.post('/users/login', data);
export const register = (data) => api.post('/users/register', data);
export const fetchUserProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);

// Problem Services
export const fetchProblems = () => api.get('/problems');
export const fetchProblemById = (id) => api.get(`/problems/${id}`);

// Submission Services
export const submitCode = (data) => api.post('/submissions', data);
export const fetchSubmissions = () => api.get('/submissions');

// --- Learning & Testing ---

// Courses
export const fetchCourses = () => api.get('/courses'); // Public access via courseRoutes
export const fetchUserCourses = () => api.get('/courses');

// Test Execution
export const fetchUpcomingTests = () => api.get('/tests'); // Public test list? testRoutes mounted at /api/admin/tests.
// Okay, the backend implementation puts everything under /api/admin. 
// EXCEPT: testExecutionRoutes is at /api/tests.
export const startTest = (testId) => api.post(`/tests/${testId}/start`);
export const fetchTestQuestions = (testId) => api.get(`/tests/${testId}/questions`);
export const saveAnswer = (testId, data) => api.post(`/tests/${testId}/answer`, data);
export const submitTest = (testId) => api.post(`/tests/${testId}/submit`);
export const fetchTestResults = (testId) => api.get(`/tests/${testId}/results`);

// Contests (Public)
export const fetchPublicContests = () => api.get('/contests'); // contestExecutionRoutes mounted at /api/contests
export const registerForContest = (id) => api.post(`/contests/${id}/register`);
export const getRegistrationStatus = (id) => api.get(`/contests/${id}/status`);

// Dashboard
export const fetchUserActivity = () => api.get('/dashboard/activity');
export const fetchUserProgress = () => api.get('/dashboard/progress');

export default api;
