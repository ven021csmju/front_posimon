import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, 

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      // Diagnostic: Log JWT payload if in dev
      if (import.meta.env.DEV) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT Diagnostic Payload:', payload);
        } catch (e) {
          console.error('JWT Diagnostic: Failed to parse token payload', e);
        }
      }
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    const token = get().token;
    set({ user, isAuthenticated: !!(token && user) });
  },

  fetchUser: async () => {
    const currentToken = get().token;
    console.log('fetchUser: Starting session verification...', { 
      hasToken: !!currentToken, 
      tokenPrefix: currentToken ? currentToken.substring(0, 10) + '...' : 'none',
      url: api.defaults.baseURL 
    });
    set({ isLoading: true });
    try {
      // First try /auth/me as per new production guidelines
      let response;
      try {
        console.log('fetchUser: Attempting GET /auth/me');
        response = await api.get<User>('/auth/me');
      } catch (err: any) {
        // Fallback to /users/me if /auth/me is missing (404) or broken (500)
        if (err.response?.status === 404 || err.response?.status === 500) {
          console.warn(`fetchUser: /auth/me failed (${err.response?.status}), trying /users/me fallback`);
          response = await api.get<User>('/users/me');
        } else {
          console.error('fetchUser: /auth/me failed with status:', err.response?.status, err.response?.data);
          throw err;
        }
      }
      console.log('fetchUser: Success! User data:', {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role
      });
      // Save user to state and localStorage
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
    } catch (error: any) {
      console.error('fetchUser: Session verification failed globally:', 
        error.response?.status, 
        error.response?.data?.detail || error.message
      );
      
      // We STOP clearing the session automatically on 401/403 during fetchUser.
      // This prevents the "bounce" back to login if the profile endpoint is broken
      // but the token might still be valid for other operations (like POS).
      const isUnauthorized = error.response?.status === 401 || error.response?.status === 403;
      if (isUnauthorized) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, token: null });
    window.location.href = '/login';
  },
}));
