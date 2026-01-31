import apiClient from './apiClient.js';

// Auth
export const login = (formData) => apiClient.post('/users/login', formData);

// --- Admin API ---

// Users
export const fetchUsers = () => apiClient.get('/admin/users');
export const deleteUser = (id) => apiClient.delete(`/admin/users/${id}`);

// Problems (Coding)
export const fetchProblems = () => apiClient.get('/admin/problems');
export const createProblem = (data) => apiClient.post('/admin/problems', data);
export const updateProblem = (id, data) => apiClient.put(`/admin/problems/${id}`, data);

// Questions (MCQ/Quiz)
export const fetchQuestions = (params) => apiClient.get('/admin/questions', { params });
export const createQuestion = (data) => apiClient.post('/admin/questions', data);
export const updateQuestion = (id, data) => apiClient.put(`/admin/questions/${id}`, data);
export const deleteQuestion = (id) => apiClient.delete(`/admin/questions/${id}`);
export const fetchQuestionHistory = (id) => apiClient.get(`/admin/questions/${id}/history`);

// Tests
export const fetchTests = () => apiClient.get('/admin/tests');
export const fetchTestById = (id) => apiClient.get(`/admin/tests/${id}`);
export const createTest = (data) => apiClient.post('/admin/tests', data);
export const updateTest = (id, data) => apiClient.put(`/admin/tests/${id}`, data);
export const deleteTest = (id) => apiClient.delete(`/admin/tests/${id}`);
export const cloneTest = (id) => apiClient.post(`/admin/tests/${id}/clone`);
export const addQuestionsToTest = (testId, questionIds) => apiClient.post(`/admin/tests/${testId}/questions`, { questionIds });
export const removeQuestionFromTest = (testId, questionId) => apiClient.delete(`/admin/tests/${testId}/questions/${questionId}`);
export const reorderTestQuestions = (testId, orders) => apiClient.put(`/admin/tests/${testId}/questions/reorder`, { orders });

// Contests
export const fetchContests = () => apiClient.get('/admin/contests');
export const createContest = (data) => apiClient.post('/admin/contests', data);
export const updateContest = (id, data) => apiClient.put(`/admin/contests/${id}`, data);
export const deleteContest = (id) => apiClient.delete(`/admin/contests/${id}`);

// Courses
export const fetchCourses = () => apiClient.get('/admin/courses');
export const createCourse = (data) => apiClient.post('/admin/courses', data);
export const updateCourse = (id, data) => apiClient.put(`/admin/courses/${id}`, data);
export const deleteCourse = (id) => apiClient.delete(`/admin/courses/${id}`);

// Course Structure
export const addLevel = (courseId, data) => apiClient.post(`/admin/courses/${courseId}/levels`, data);
export const addModule = (levelId, data) => apiClient.post(`/admin/courses/levels/${levelId}/modules`, data);
export const addTopic = (moduleId, data) => apiClient.post(`/admin/courses/modules/${moduleId}/topics`, data);
export const addContent = (topicId, data) => apiClient.post(`/admin/courses/topics/${topicId}/contents`, data);
// Add delete/update for structure if needed

// Analytics
export const fetchDashboardStats = () => apiClient.get('/admin/analytics/dashboard');
export const fetchLeaderboard = () => apiClient.get('/admin/analytics/leaderboard');
export const fetchQuestionDifficulty = () => apiClient.get('/admin/analytics/reports/questions');

export default apiClient;
