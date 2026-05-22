import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const initialToken = localStorage.getItem('token');
const initialUser = readCachedUser();

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  fetchUser: (options?: { silent?: boolean }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!(initialToken && initialUser),
  // Only block UI when we must verify a token without cached profile
  isLoading: !!initialToken && !initialUser,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    const user = get().user;
    set({ token, isAuthenticated: !!(token && user) });
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

  fetchUser: async (options) => {
    const currentToken = get().token ?? localStorage.getItem('token');
    if (!currentToken) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    if (!options?.silent) {
      set({ isLoading: true });
    }

    try {
      let response;
      try {
        response = await api.get<User>('/auth/me');
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || status === 500) {
          response = await api.get<User>('/users/me');
        } else {
          throw err;
        }
      }

      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, token: currentToken, isAuthenticated: true });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const isUnauthorized = status === 401 || status === 403;
      const isNetworkError = !(error as { response?: unknown })?.response;

      if (isUnauthorized || isNetworkError) {
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
    set({ user: null, isAuthenticated: false, token: null, isLoading: false });
    window.location.href = '/login';
  },
}));
