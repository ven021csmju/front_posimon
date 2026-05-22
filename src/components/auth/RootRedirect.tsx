import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import PageLoader from '../ui/PageLoader';

/** Sends `/` to login or the right workspace after auth is resolved. */
export default function RootRedirect() {
  const { user, isAuthenticated, isLoading, token } = useAuthStore();

  if (isLoading && token) {
    return <PageLoader label="Loading PoSimon..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'manager' || user.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }

  return <Navigate to="/home" replace />;
}
