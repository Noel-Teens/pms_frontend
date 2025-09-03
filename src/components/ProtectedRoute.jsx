import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

// ProtectedRoute component to handle authentication and role-based access
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth state is being determined
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // toast.error('Please login to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && user?.role !== requiredRole) {
    toast.error('You do not have permission to access this page');
    console.log('user role', user?.role);
    console.log('required role', requiredRole);
    // Redirect admin to admin dashboard if trying to access user routes
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    // Redirect regular users to user dashboard if trying to access admin routes
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and has required role (or no specific role required), render children
  return children;
};

export default ProtectedRoute;