import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Use Absolute URL to ensure cookies are sent to the correct domain (Render)
// Proxying (/api) often fails with cross-domain HttpOnly cookies.
const baseURL = 'https://possimon.onrender.com/api';
export const ABSOLUTE_API_URL = 'https://possimon.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // Only redirect if it's a main API call, not a background check or specific asset
      const isAuthPath = error.config.url.includes('/auth/');
      const isOrderPath = error.config.url.includes('/orders');
      
      if (!isAuthPath && isOrderPath) {
        console.warn('Unauthorized on order creation! Redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
