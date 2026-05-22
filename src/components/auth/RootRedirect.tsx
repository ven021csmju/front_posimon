import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/** Sends `/` to login or the right workspace after auth is resolved. */
export default function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070606]">
        <div className="text-2xl font-sans font-black text-[#d6b66b] animate-pulse">Loading PoSimon...</div>
      </div>
    );
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
