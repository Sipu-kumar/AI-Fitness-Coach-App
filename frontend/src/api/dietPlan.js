import API from './api';

// Instructor diet plan functions
export const createDietPlan = (data) => API.post('/diet-plan/create', data);
export const getUserDietPlans = (userId) => API.get(`/diet-plan/user/${userId}`);
export const updateDietPlan = (planId, data) => API.put(`/diet-plan/${planId}`, data);
export const deactivateDietPlan = (planId) => API.put(`/diet-plan/${planId}/deactivate`);
export const getAllDietPlans = () => API.get('/diet-plan/all');

// User diet plan functions
export const getMyActiveDietPlan = () => API.get('/diet-plan/my-plan');
export const getMyDietPlans = () => API.get('/diet-plan/my-plans');
