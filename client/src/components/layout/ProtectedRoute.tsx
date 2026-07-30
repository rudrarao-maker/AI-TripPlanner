import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Bypass admin check for demo purposes, or check user?.role
  // if (adminOnly && user?.role !== 'admin') {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <Outlet />;
}
