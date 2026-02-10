import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/api/auth/register', { username, email, password }),
};

// User API
export const userApi = {
  getCurrentUser: () => api.get('/api/users/me'),

  updateProfile: (data: { username?: string; avatarUrl?: string }) =>
    api.put('/api/users/me', data),

  searchUsers: (query: string) => api.get(`/api/users/search?q=${encodeURIComponent(query)}`),

  getUserById: (id: number) => api.get(`/api/users/${id}`),
};
