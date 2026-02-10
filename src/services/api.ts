import axios, { type AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
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

// Friend API
export const friendApi = {
  // Get friends list
  getFriends: () => api.get('/api/friends'),

  // Get pending friend requests
  getPendingRequests: () => api.get('/api/friends/requests'),

  // Send friend request
  sendFriendRequest: (userId: number) =>
    api.post('/api/friends/request', { userId }),

  // Accept or reject friend request
  handleFriendRequest: (requestId: number, accept: boolean) =>
    api.put(`/api/friends/request/${requestId}`, { accept }),

  // Delete friend or cancel request
  deleteFriend: (friendId: number) =>
    api.delete(`/api/friends/${friendId}`),
};
