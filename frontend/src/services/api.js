import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://dreams-saloon-project.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyToken: () => api.get('/auth/verify'),
};

// Customer API
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getStats: (id) => api.get(`/customers/${id}/stats`),
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getPerformance: (id, params) => api.get(`/employees/${id}/performance`, { params }),
  getAvailable: (serviceName, params) => api.get(`/employees/available/${serviceName}`, { params }),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (date, params) => api.get(`/appointments/available-slots/${date}`, { params }),
  getDashboardStats: () => api.get('/appointments/stats/dashboard'),
  getServicePricing: () => api.get('/appointments/services/pricing'),
};

// Billing API
export const billingAPI = {
  getAll: (params) => api.get('/billing', { params }),
  getById: (id) => api.get(`/billing/${id}`),
  createBill: (appointmentId, data) => api.post(`/billing/create/${appointmentId}`, data),
  updatePayment: (id, data) => api.put(`/billing/${id}/payment`, data),
  getStats: (params) => api.get('/billing/stats/overview', { params }),
  getReceipt: (id) => api.get(`/billing/${id}/receipt`),
  search: (query, params) => api.get(`/billing/search/${query}`, { params }),
};

// General API utilities
export const apiUtils = {
  healthCheck: () => api.get('/health'),
};

export default api;