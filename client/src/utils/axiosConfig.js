import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
