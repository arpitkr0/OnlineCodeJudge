import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV || window.location.port === '5173') {
    return 'http://localhost:8080/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle authentication errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're trying to login or register
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const problemsAPI = {
  list: (difficulty = '', page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (difficulty && difficulty !== 'ALL') params.append('difficulty', difficulty);
    params.append('page', page);
    params.append('size', size);
    return api.get(`/problems?${params.toString()}`);
  },
  getById: (id) => api.get(`/problems/${id}`),
  create: (data) => api.post('/problems', data),
};

export const submissionsAPI = {
  submit: (data) => api.post('/submissions', data),
  getById: (id) => api.get(`/submissions/${id}`),
  getMySubmissions: (page = 0, size = 20) => api.get(`/submissions/me?page=${page}&size=${size}`),
};

export default api;
