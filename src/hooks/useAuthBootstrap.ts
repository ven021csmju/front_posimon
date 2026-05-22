import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

/** Validates session once on app start without re-running on every user update. */
export function useAuthBootstrap() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');

    if (!token) {
      localStorage.removeItem('user');
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    // Cached profile → show UI immediately, refresh in background
    if (cachedUser) {
      fetchUser({ silent: true });
      return;
    }

    fetchUser();
  }, [fetchUser]);
}
