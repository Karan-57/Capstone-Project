import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('collabo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Middleware redirect to /login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.setItem('collabo_auth', 'false');
      localStorage.removeItem('collabo_token');
      localStorage.removeItem('collabo_user');

      // Only redirect if not already on an auth screen
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        !window.location.pathname.startsWith('/auth/')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getApiStatus = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('API connection error:', error);
    return null;
  }
};

export default api;
