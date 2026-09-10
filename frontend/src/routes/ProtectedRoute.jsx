import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, setRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (requiredRole && role !== requiredRole) {
      setRole(requiredRole);
    }
  }, [requiredRole, role, setRole]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
