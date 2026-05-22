import api from './axios';

export const registerUser = (data) =>
  api.post('/auth/register/', data);

export const loginUser = (email, password) =>
  api.post('/auth/login/', { email, password });

export const getProfile = () =>
  api.get('/auth/profile/');

export const updateProfile = (data) =>
  api.patch('/auth/profile/', data);

// Admin
export const getAllUsers = (params) =>
  api.get('/auth/users/', { params });

export const updateUserRole = (id, data) =>
  api.patch(`/auth/users/${id}/`, data);