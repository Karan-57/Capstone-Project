import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthLoading, role, setRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (requiredRole && role !== requiredRole) {
      setRole(requiredRole);
    }
  }, [requiredRole, role, setRole]);

  // While checking refresh token on initial page load / F5 refresh, show clean loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


export default ProtectedRoute;
