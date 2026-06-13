import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  requireRole?: string;
};

export function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && role !== requireRole) {
    if (requireRole === 'student' && role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (requireRole === 'admin' && role === 'student') {
      return <Navigate to="/app" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
