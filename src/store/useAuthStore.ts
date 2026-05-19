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
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, 

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
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
        if (err.response?.status === 404) {
          console.warn('fetchUser: /auth/me not found (404), trying /users/me fallback');
          response = await api.get<User>('/users/me');
        } else {
          console.error('fetchUser: /auth/me failed with status:', err.response?.status, err.response?.data);
          throw err;
        }
      }
      console.log('fetchUser: Success! User data:', response.data);
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      console.error('fetchUser: Session verification failed globally:', 
        error.response?.status, 
        error.response?.data?.detail || error.message
      );
      // Only clear auth if it's a definitive 401 or 403
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('fetchUser: Clearing session due to 401/403');
        set({ user: null, isAuthenticated: false, token: null });
        localStorage.removeItem('token');
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
    set({ user: null, isAuthenticated: false, token: null });
    window.location.href = '/login';
  },
}));
