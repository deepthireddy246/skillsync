import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Resume API
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze: (resumeId, targetJob) => api.post(`/resume/analyze/${resumeId}`, { targetJob }),
  getHistory: (params) => api.get('/resume/history', { params }),
  getResume: (resumeId) => api.get(`/resume/${resumeId}`),
  deleteResume: (resumeId) => api.delete(`/resume/${resumeId}`),
};

// Admin API (example)
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export default api; 