import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import Loading from '../components/common/Loading';

/**
 * ProtectedRoute component:
 * - Redirects unauthenticated users to /login
 * - Optionally checks required role and redirects to /unauthorized
 * - Preserves target path in location state for post-login redirect
 */
export default function ProtectedRoute({ requiredRole = null, children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading message="Verifying authentication session..." fullPage size="lg" />;
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}
