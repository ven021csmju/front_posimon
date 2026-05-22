import axios from 'axios';

// Use relative URL to work with Vite proxy in dev and Vercel rewrites in prod.
// This is the standard way to avoid CORS issues on localhost.
const baseURL = '/api';
export const ABSOLUTE_API_URL = 'https://possimon.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage to avoid circular dependency with useAuthStore
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug log for authentication headers (safely truncated)
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Auth: Bearer ${token.substring(0, 10)}...`);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - No Auth Token`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Specialized handling for 401 errors
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthPath = url.includes('/auth/');
      const isOrderPath = url.includes('/orders');
      
      if (import.meta.env.DEV) {
        console.error(`[API Error] 401 Unauthorized: ${url}`, error.response?.data);
      }

      // If unauthorized on critical actions (like order creation), we might need to force login
      if (!isAuthPath && isOrderPath) {
        console.warn('Unauthorized on critical path! (Automatic redirect DISABLED for debugging)');
        /*
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        */
      }
    }
    return Promise.reject(error);
  }
);

export default api;
