import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

export const Login = ({ initialRole }) => {
  const { isAuthenticated, role: userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const role = initialRole || (paramRole === 'editor' || paramRole === 'freelancer' ? 'editor' : paramRole === 'creator' ? 'creator' : (userRole === 'freelancer' ? 'editor' : userRole) || 'creator');

  if (isAuthenticated) {
    return <Navigate to={(userRole === 'editor' || userRole === 'freelancer') ? '/editor/dashboard' : '/creator/dashboard'} replace />;
  }

  return (
    <AuthModal
      key={`login-${role}`}
      isOpen={true}
      isFullPage={true}
      initialMode="login"
      initialRole={role}
    />
  );
};

export default Login;
