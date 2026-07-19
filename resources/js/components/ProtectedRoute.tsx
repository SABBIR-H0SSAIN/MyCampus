import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  requireRole?: string;
};

export function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect users who are not fully approved (except admins, who don't go through student approval)
  if (user && role !== 'admin') {
    if (user.registration_status === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user.registration_status === 'rejected') {
      return <Navigate to="/registration-rejected" replace />;
    }
  }

  if (requireRole && role !== requireRole) {
    if (requireRole === 'student' && role === 'admin') {
      // Admins are allowed to view student routes
    } else if (requireRole === 'admin' && role === 'student') {
      return <Navigate to="/app" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
