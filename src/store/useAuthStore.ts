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
  token: null,
  isAuthenticated: false,
  isLoading: true, // Set to true to handle initial session check

  setToken: (token) => {
    // We keep the token in memory for things like WebSockets,
    // but we don't persist it to localStorage as per HttpOnly cookie strategy.
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  fetchUser: async () => {
    console.log('fetchUser: Starting session verification...');
    set({ isLoading: true });
    try {
      // First try /auth/me as per new production guidelines
      let response;
      try {
        console.log('fetchUser: Attempting GET /auth/me');
        response = await api.get<User>('/auth/me');
      } catch (err) {
        console.warn('fetchUser: /auth/me failed, trying /users/me fallback', err);
        // Fallback to /users/me if /auth/me is not available yet
        response = await api.get<User>('/users/me');
      }
      console.log('fetchUser: Success! User data:', response.data);
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      console.error('fetchUser: Session verification failed:', error.response?.status, error.message);
      set({ user: null, isAuthenticated: false });
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
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));
